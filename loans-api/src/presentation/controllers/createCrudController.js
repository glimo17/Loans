const createCrudController = (tableConfig, repository) => {
  const requiredFields = tableConfig.columns.filter((column) => column.required).map((column) => column.field);

  const getAll = async (req, res, next) => {
    try {
      const rows = await repository.getAll();
      res.json(rows);
    } catch (error) {
      next(error);
    }
  };

  const getById = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: 'Invalid id parameter.' });
      }

      const row = await repository.getById(id);
      if (!row) {
        return res.status(404).json({ message: `${tableConfig.resource} record not found.` });
      }

      return res.json(row);
    } catch (error) {
      next(error);
    }
  };

  const create = async (req, res, next) => {
    try {
      const missingFields = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');

      if (missingFields.length) {
        return res.status(400).json({
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      const created = await repository.create(req.body);
      return res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  };

  const update = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: 'Invalid id parameter.' });
      }

      const updated = await repository.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: `${tableConfig.resource} record not found.` });
      }

      return res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  const remove = async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: 'Invalid id parameter.' });
      }

      const deleted = await repository.remove(id);
      if (!deleted) {
        return res.status(404).json({ message: `${tableConfig.resource} record not found.` });
      }

      return res.json(deleted);
    } catch (error) {
      next(error);
    }
  };

  return {
    getAll,
    getById,
    create,
    update,
    remove
  };
};

module.exports = createCrudController;
