# \# Mini ERP + CRM Operations Portal

# 

# A professional full-stack ERP and CRM operations portal designed to manage customers, products, inventory, sales challans, follow-ups, users, and operational workflows from a single dashboard.

# 

# \## Overview

# 

# The Mini ERP + CRM Operations Portal combines CRM, inventory, sales, and operational management into one web application.

# 

# It is built with a modern TypeScript stack and uses PostgreSQL with Prisma for reliable relational data management.

# 

# \## Features

# 

# \### CRM

# \- Customer management

# \- Customer profiles

# \- Customer search and filtering

# \- Customer types

# \- Customer status management

# \- Follow-up tracking

# \- Customer notes

# \- GST information

# \- Contact and business information

# 

# \### Inventory

# \- Product management

# \- SKU tracking

# \- Product categories

# \- Current stock tracking

# \- Minimum stock thresholds

# \- Warehouse locations

# \- Stock-in and stock-out movements

# \- Inventory history

# 

# \### Sales

# \- Sales challan management

# \- Challan numbering

# \- Draft and confirmed challans

# \- Challan line items

# \- Customer-linked sales

# \- Product snapshots

# \- Quantity tracking

# 

# \### Dashboard

# \- Operational overview

# \- Customer statistics

# \- Inventory insights

# \- Sales activity

# \- Low-stock visibility

# \- Business metrics

# 

# \### Authentication \& Access Control

# The application supports role-based access control.

# 

# Available roles:

# 

# \- ADMIN

# \- SALES

# \- WAREHOUSE

# \- ACCOUNTS

# 

# Different roles receive different permissions throughout the application.

# 

# \## Technology Stack

# 

# \### Frontend

# 

# \- React

# \- TypeScript

# \- Vite

# \- Tailwind CSS

# \- React Router

# \- TanStack React Query

# \- React Hook Form

# \- Zod

# \- Lucide Icons

# 

# \### Backend

# 

# \- Node.js

# \- Express

# \- TypeScript

# \- Prisma ORM

# \- PostgreSQL

# \- JWT authentication

# \- bcrypt

# 

# \### Development

# 

# \- Docker

# \- Docker Compose

# \- Prisma Migrations

# \- Prisma Studio

# \- npm Workspaces

# 

# \## Project Structure

# 

# ```text

# Mini ERP + CRM Operations Portal/

# │

# ├── client/

# │   ├── src/

# │   ├── public/

# │   └── package.json

# │

# ├── server/

# │   ├── src/

# │   ├── prisma/

# │   │   ├── schema.prisma

# │   │   ├── seed.ts

# │   │   └── migrations/

# │   └── package.json

# │

# ├── package.json

# ├── docker-compose.yml

# └── README.md

