# Admin Force Management Feature

## Overview

This feature allows admins to create and manage forces (guilds/factions) with custom logos/pictures. Admins can:
- Create new forces with names, descriptions, and logos
- Upload/update force logos
- Edit force details
- Delete forces

---

## Database Schema Changes

### New `forces` table:
```sql
CREATE TABLE forces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  logo_url VARCHAR(500) DEFAULT '',
  description TEXT DEFAULT '',
  admin_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Updated `users` table:
```sql
ALTER TABLE users ADD COLUMN is_admin TINYINT(1) DEFAULT 0;
```

---

## Setting Up Admin Access

### Make a user an admin (run in MySQL):

```sql
UPDATE users SET is_admin = 1 WHERE id = <user_id>;
```

Or:

```sql
UPDATE users SET is_admin = 1 WHERE email = 'user@example.com';
```

---

## Using the Admin Panel

### Access the admin panel:
1. Login as an admin user
2. Navigate to: `https://yourapp.com/admin/forces`

### Create a force:
1. Fill in the force name (e.g., "Sukuna & Co")
2. Add a description (optional)
3. Upload a logo image (JPEG, PNG, GIF, WebP - max 5MB)
4. Click "Create Force"

### Edit a force:
1. Click "Edit" on any force card
2. Modify the name and/or description
3. Optionally upload a new logo
4. Click "Save Changes"

### Delete a force:
1. Click "Delete" on any force card
2. Confirm deletion

---

## API Endpoints

### Create Force
```
POST /api/forces
Headers: Content-Type: multipart/form-data
Body:
  - name: string (required)
  - description: string (optional)
  - logo: file (required, image only)
```

### Get All Forces
```
GET /api/forces
Response: Array of force objects
```

### Get Force by ID
```
GET /api/forces/:id
Response: Single force object
```

### Update Force
```
PUT /api/forces/:id
Headers: Content-Type: application/json
Body:
  - name: string (optional)
  - description: string (optional)
```

### Update Force Logo
```
PUT /api/forces/:id/logo
Headers: Content-Type: multipart/form-data
Body:
  - logo: file (image only)
```

### Delete Force
```
DELETE /api/forces/:id
```

---

## File Storage

- Logos are stored in: `backend/uploads/forces/`
- Served at: `http://yourapp.com/uploads/forces/<filename>`
- Files are auto-deleted when force is deleted

> ⚠️ Add `uploads/` to `.gitignore` to prevent storing large files in git

---

## Frontend Integration

### Display force logos in other pages:

```html
<img src="https://yourapp.com/api/forces/1/logo.url" alt="Force Logo">
```

Or fetch force data:

```javascript
const res = await fetch('/api/forces');
const forces = await res.json();

forces.forEach(force => {
  console.log(force.name, force.logo_url);
});
```

---

## Security Features

- ✅ Admin-only access (checked in routes)
- ✅ File type validation (images only)
- ✅ File size limit (5MB max)
- ✅ SQL injection protection (parameterized queries)
- ✅ Session-based authentication

---

## Deployment Notes

### For Render:

1. The `uploads/` directory is ephemeral (resets on deployment)
2. Options:
   - Use external storage (AWS S3, Cloudinary, etc.)
   - Use a persistent volume if Render supports it
   - Store base64 images in database (not recommended for large files)

### For other platforms:

Set up persistent file storage or cloud storage service.

---

## Example: Adding Forces to Dashboard

### In `dashboard.html`:

```html
<div id="forcesList"></div>

<script>
  async function loadForces() {
    const res = await fetch('/api/forces');
    const forces = await res.json();
    
    document.getElementById('forcesList').innerHTML = forces.map(force => `
      <div class="force-item">
        <img src="${force.logo_url}" alt="${force.name}" style="width: 100px; height: 100px;">
        <h3>${force.name}</h3>
        <p>${force.description}</p>
      </div>
    `).join('');
  }
  
  loadForces();
</script>
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 403 Forbidden when accessing admin panel | User is not marked as admin. Run: `UPDATE users SET is_admin = 1 WHERE id = <user_id>` |
| Logo upload fails | Check file size (<5MB) and type (JPEG/PNG/GIF/WebP) |
| Logos disappear after deployment | Set up persistent storage or cloud CDN |
| 'mysql' command not found | Install MySQL client or use full path to mysql.exe |

---

## Next Steps

1. Update dashboard to display forces
2. Link forces to guild wars or auction rooms
3. Set up cloud storage for production (S3, Cloudinary, etc.)
4. Add role-based access control for different force management levels

