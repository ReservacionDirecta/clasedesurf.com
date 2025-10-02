import express from 'express';
import prisma from '../prisma';

const router = express.Router();

// GET /classes - list classes
router.get('/', async (req, res) => {
  try {
    const classes = await prisma.class.findMany({ include: { school: true }, orderBy: { date: 'asc' } });
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /classes - create class
router.post('/', async (req, res) => {
  try {
    const { title, description, date, duration, capacity, price, level, schoolId, instructorId } = req.body;
    if (!title || !date || !duration || !capacity || !price || !level || !schoolId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const classDate = new Date(date);
    if (classDate < new Date()) return res.status(400).json({ message: 'Class date cannot be in the past' });

    if (capacity <= 0) return res.status(400).json({ message: 'Capacity must be greater than zero' });

    const newClass = await prisma.class.create({
      data: {
        title,
        description,
        date: classDate,
        duration: Number(duration),
        capacity: Number(capacity),
        price: Number(price),
        level,
        school: { connect: { id: Number(schoolId) } },
        instructor: instructorId ? { connect: { id: Number(instructorId) } } : undefined,
      }
    });

    res.status(201).json(newClass);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /classes/:id - update class
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const updated = await prisma.class.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /classes/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.class.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
