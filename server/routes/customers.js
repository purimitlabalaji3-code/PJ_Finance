import express from 'express';
import sql from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/customers
router.get('/', auth, async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM customers ORDER BY created_at DESC`;
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/customers/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const [row] = await sql`SELECT * FROM customers WHERE id = ${req.params.id}`;
    if (!row) return res.status(404).json({ error: 'Customer not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/customers
router.post('/', auth, async (req, res) => {
  try {
    const { name, phone, age, gender, aadhaar, address, image } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });

    // 1. Generate Next Customer Code (PJ-XXX)
    // We get the max ID to ensure we don't have collisions even if some are deleted
    const [lastCustomer] = await sql`SELECT id FROM customers ORDER BY id DESC LIMIT 1`;
    const nextId = (lastCustomer?.id || 0) + 1;
    const customerCode = `PJ-${String(nextId).padStart(3, '0')}`;

    const [row] = await sql`
      INSERT INTO customers (customer_code, name, phone, age, gender, aadhaar, address, image)
      VALUES (${customerCode}, ${name}, ${phone}, ${age || null}, ${gender || null}, ${aadhaar || null}, ${address || null}, ${image || null})
      RETURNING *
    `;
    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/customers/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, phone, age, gender, aadhaar, address, status, image } = req.body;
    const [row] = await sql`
      UPDATE customers
      SET name=${name}, phone=${phone}, age=${age}, gender=${gender},
          aadhaar=${aadhaar}, address=${address}, status=${status}, image=${image || null}
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await sql`DELETE FROM customers WHERE id = ${req.params.id}`;
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
