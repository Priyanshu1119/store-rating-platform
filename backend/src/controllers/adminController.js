const asyncHandler = require('../utils/asyncHandler');
const adminService = require('../services/adminService');

const getDashboard = asyncHandler(async (req, res) => {
  res.json({ data: await adminService.getDashboard() });
});

const listUsers = asyncHandler(async (req, res) => {
  res.json(await adminService.listUsers(req.query));
});

const getUser = asyncHandler(async (req, res) => {
  res.json({ data: await adminService.getUserById(req.params.id) });
});

const createUser = asyncHandler(async (req, res) => {
  const user = await adminService.createUser(req.body);
  res.status(201).json({ message: 'User created successfully', data: user });
});

const listStores = asyncHandler(async (req, res) => {
  res.json(await adminService.listStores(req.query));
});

const createStore = asyncHandler(async (req, res) => {
  const store = await adminService.createStore(req.body);
  res.status(201).json({ message: 'Store created successfully', data: store });
});

const listOwners = asyncHandler(async (req, res) => {
  res.json({ data: await adminService.listAvailableOwners() });
});

module.exports = { getDashboard, listUsers, getUser, createUser, listStores, createStore, listOwners };
