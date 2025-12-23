# Backend API Requirements

Your backend needs to implement the following endpoints:

## Base URL
Default: `http://localhost:3000/api`

Set via environment variable: `VITE_API_BASE_URL`

## Endpoints

### 1. Initialize Default Templates
**POST** `/api/templates/initialize`

Creates default templates if they don't exist. Should be idempotent (safe to call multiple times).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "template_1",
      "name": "Email Template",
      "content": "<h2>Email Template</h2>...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    ...
  ]
}
```

### 2. Get All Templates
**GET** `/api/templates`

Returns all templates.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "template_1",
      "name": "Email Template",
      "content": "<h2>Email Template</h2>...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 3. Get Template by ID
**GET** `/api/templates/:id`

Returns a single template.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_1",
    "name": "Email Template",
    "content": "<h2>Email Template</h2>...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update Template
**PUT** `/api/templates/:id`

Updates template content.

**Request Body:**
```json
{
  "content": "<h2>Updated content...</h2>"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_1",
    "name": "Email Template",
    "content": "<h2>Updated content...</h2>",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 5. Create Template
**POST** `/api/templates`

Creates a new template.

**Request Body:**
```json
{
  "name": "New Template",
  "content": "<h2>Content...</h2>"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_new",
    "name": "New Template",
    "content": "<h2>Content...</h2>",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 6. Delete Template
**DELETE** `/api/templates/:id`

Deletes a template.

**Response:**
```json
{
  "success": true,
  "data": true
}
```

## Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "message": "Error description"
}
```

## Default Templates Structure

The backend should create these 5 default templates on initialization:

1. **Email Template** - Email format with To, Subject, Dear, body, Best regards
2. **Invoice Template** - Invoice format with Invoice #, Date, Bill To, Items, Total
3. **Letter Template** - Letter format with Address, Date, Recipient, body, Signature
4. **Report Template** - Report format with Title, Summary, Introduction, Findings, Conclusion
5. **Meeting Notes Template** - Meeting notes format with Date, Attendees, Agenda, Discussion, Action Items

See `src/utils/templateService.ts` for the exact content structure of each template.

