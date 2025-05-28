# University Project Backend API

A modern Node.js backend API built with Express.js, MySQL, and Prisma ORM.

## Features

- Express.js REST API
- MySQL database with Prisma ORM
- Input validation with express-validator
- Security middleware with helmet
- CORS enabled
- API request logging with morgan
- Environment variable configuration
- Error handling middleware
- Example CRUD endpoints

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## Setup

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd <project-directory>
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a .env file in the root directory with the following content:
   \`\`\`
   PORT=3000
   NODE_ENV=development
   DATABASE_URL="mysql://root:Leaguelol7.@localhost:3306/my_uni_project"
   \`\`\`

4. Initialize Prisma and generate the client:
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   \`\`\`

## Running the Application

Development mode with hot-reload:
\`\`\`bash
npm run dev
\`\`\`

Production mode:
\`\`\`bash
npm start
\`\`\`

## API Endpoints

### Examples Resource

- GET /api/examples - Get all examples
- GET /api/examples/:id - Get example by ID
- POST /api/examples - Create new example
- PUT /api/examples/:id - Update example
- DELETE /api/examples/:id - Delete example

### Health Check

- GET /health - Check API health status

## Project Structure

\`\`\`
├── src/
│ ├── index.js # Application entry point
│ └── routes/
│ └── api.js # API routes
├── prisma/
│ └── schema.prisma # Database schema
├── .env # Environment variables
├── package.json # Project dependencies
└── README.md # Project documentation
\`\`\`

## Error Handling

The API includes a global error handling middleware that catches and formats errors appropriately. All endpoints include proper error handling and validation.
