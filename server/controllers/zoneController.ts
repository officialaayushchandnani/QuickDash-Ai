import { Request, Response } from 'express';
import { ahmedabadZones } from './seed.ts';
import asyncHandler from '../utils/asyncHandler';

export const getZones = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(ahmedabadZones);
});