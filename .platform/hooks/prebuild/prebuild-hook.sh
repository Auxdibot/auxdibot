#!/bin/bash
mkdir node_modules
npm install -g pnpm
pnpm install
pnpx prisma generate