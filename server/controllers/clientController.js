import Client from "../models/Client.js";

// CREATE CLIENT
export const createClient = async (req, res) => {
  try {
    const client = await Client.create({
      ...req.body,
      user: req.user.id
    });

    res.json(client);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// GET USER CLIENTS
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ user: req.user.id });
    res.json(clients);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// UPDATE CLIENT
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(client);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// DELETE CLIENT
export const deleteClient = async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json("Client deleted");
  } catch (err) {
    res.status(500).json(err.message);
  }
};