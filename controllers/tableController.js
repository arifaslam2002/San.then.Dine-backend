import Table from "../models/Table.js";

export const getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({
      tableNumber: 1,
    });

    res.status(200).json(tables);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch tables",
      error: error.message,
    });
  }
};

export const createTable = async (req, res) => {
  try {
    const { tableNumber } = req.body;

    if (!tableNumber) {
      return res.status(400).json({
        message: "Table number is required",
      });
    }

    const existingTable = await Table.findOne({
      tableNumber,
    });

    if (existingTable) {
      return res.status(400).json({
        message: "Table already exists",
      });
    }

    const table = await Table.create({
      tableNumber,
    });

    res.status(201).json({
      message: "Table created successfully",
      table,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create table",
      error: error.message,
    });
  }
};
export const getTableByNumber = async (req, res) => {
  try {
    const table = await Table.findOne({
      tableNumber: req.params.tableNumber,
    });

    if (!table) {
      return res.status(404).json({
        message: "Table not found",
      });
    }

    if (!table.active) {
      return res.status(400).json({
        message: "Table is not active",
      });
    }

    res.status(200).json(table);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch table",
      error: error.message,
    });
  }
};
export const getTablesWithAvailability = async (req, res) => {
  try {
    const tables = await Table.find({ active: true });

    const result = await Promise.all(
      tables.map(async (table) => {
        const sessions = await DiningSession.find({
          tableNumber: table.tableNumber,
          status: "active",
        });

        const occupiedSeats = sessions.reduce(
          (total, session) => total + session.guestCount,
          0,
        );

        const availableSeats = Math.max(
          0,
          table.capacity - occupiedSeats,
        );

        return {
          _id: table._id,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          occupiedSeats,
          availableSeats,
          status: availableSeats === 0 ? "occupied" : "available",
        };
      }),
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Failed to fetch table availability:", error);

    res.status(500).json({
      message: "Failed to fetch table availability",
    });
  }
};