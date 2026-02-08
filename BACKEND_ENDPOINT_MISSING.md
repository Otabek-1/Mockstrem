# 🚨 ADMIN SESSIONS ENDPOINT - BACKEND IMPLEMENTATION REQUIRED

## ❌ ERROR ENCOUNTERED

```
Status: 404 Not Found
Endpoint: GET /sessions/user/74
Message: Request failed with status code 404
Location: Admin Panel → Users → Click "Sessions" button
```

**Problem:** Backend endpoint `GET /sessions/user/{user_id}` is not implemented yet.

---

## ✅ WHAT FRONTEND NEEDS

### Endpoint Definition
```
GET /sessions/user/{user_id}
```

**Authentication:** Bearer token (required)
**Permissions:** Admin only
**Query Params:** None
**Body:** Empty

### Request Example
```bash
curl -H "Authorization: Bearer <token>" \
  GET https://english-server-p7y6.onrender.com/sessions/user/74
```

### Expected Response (200 OK)
```json
[
  {
    "id": 1,
    "user_id": 74,
    "device_name": "Chrome on Windows 10",
    "device_type": "web",
    "browser": "Chrome",
    "ip_address": "192.168.1.1",
    "created_at": "2025-02-08T10:30:00Z",
    "last_activity": "2025-02-08T15:45:00Z",
    "is_active": true
  },
  {
    "id": 2,
    "user_id": 74,
    "device_name": "Safari on iPhone",
    "device_type": "mobile",
    "browser": "Safari",
    "ip_address": "203.0.113.45",
    "created_at": "2025-02-07T14:20:00Z",
    "last_activity": "2025-02-07T18:00:00Z",
    "is_active": true
  }
]
```

### Error Responses

#### 404 Not Found (Endpoint doesn't exist)
```json
{
  "detail": "Not Found"
}
```

#### 403 Forbidden (Not admin)
```json
{
  "detail": "Only admins can view other users' sessions"
}
```

#### 404 Not Found (User doesn't exist)
```json
{
  "detail": "User not found"
}
```

#### 400 Bad Request (Trying to view own sessions)
```json
{
  "detail": "Use /my-sessions endpoint for your own sessions"
}
```

---

## 🔧 IMPLEMENTATION GUIDE

### Copy-Paste Ready Code

```python
# Add this to your sessions router (routers/sessions.py or routers/session_router.py)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession
from database.db import get_db, User
from services.session_service import SessionService
from auth.auth import verify_access_token
from typing import List
from schemas.session_schema import SessionResponse


@router.get("/user/{user_id}", response_model=List[SessionResponse])
async def get_user_sessions_admin(
    user_id: int,
    current_user: User = Depends(get_current_user),  # Custom dependency
    db: DBSession = Depends(get_db)
):
    """
    🔴 ADMIN ONLY: Get all active sessions for a specific user
    
    Frontend usage: Admin Panel → Users → Click "Sessions" button
    
    Permissions:
    - Only admin users can access this endpoint
    - Admin cannot view their own sessions here (use /my-sessions)
    - Can view sessions of other users
    """
    try:
        # 1️⃣ Check if current user is admin
        if not current_user.role or current_user.role != "admin":
            raise HTTPException(
                status_code=403, 
                detail="Only admins can view other users' sessions"
            )
        
        # 2️⃣ Check if target user exists
        target_user = db.query(User).filter(User.id == user_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # 3️⃣ Prevent admin from viewing their own sessions via this endpoint
        if user_id == current_user.id:
            raise HTTPException(
                status_code=400,
                detail="Use /my-sessions endpoint for your own sessions"
            )
        
        # 4️⃣ Get all active sessions for target user
        sessions = SessionService.get_user_sessions(
            db=db,
            user_id=user_id,
            active_only=True
        )
        
        return sessions
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 📋 HELPER FUNCTION NEEDED

### SessionService.get_user_sessions()

Make sure this method exists and works correctly:

```python
# In services/session_service.py or services/sessions.py

class SessionService:
    @staticmethod
    def get_user_sessions(
        db: Session,
        user_id: int,
        active_only: bool = True
    ) -> List[SessionDB]:
        """
        Get all sessions for a user
        
        Args:
            db: Database session
            user_id: User ID to get sessions for
            active_only: If True, only return active sessions
        
        Returns:
            List of Session objects
        """
        query = db.query(SessionDB).filter(SessionDB.user_id == user_id)
        
        if active_only:
            query = query.filter(SessionDB.is_active == True)
        
        return query.order_by(SessionDB.created_at.desc()).all()
```

---

## 🏗️ DATABASE SCHEMA

Ensure Session table has these columns:

```sql
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    device_fingerprint VARCHAR(255),
    device_name VARCHAR(255),
    device_type VARCHAR(20),           -- "mobile" or "web"
    browser VARCHAR(100),
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_active (user_id, is_active),
    INDEX idx_created_at (created_at)
);
```

---

## 🔐 SECURITY CHECKLIST

- [x] Check user is admin before proceeding
- [x] Check target user exists
- [x] Prevent admin from viewing own sessions via this endpoint
- [x] Return only active sessions
- [x] Validate session ownership (implicit - filtering by user_id)
- [x] Don't expose sensitive data (fingerprint, raw device tokens, etc.)

---

## ✅ TESTING

### Test Case 1: Admin views user sessions
```python
# Setup
admin_token = login_as_admin()  # role="admin"
target_user_id = 74

# Action
response = requests.get(
    f"{BASE_URL}/sessions/user/{target_user_id}",
    headers={"Authorization": f"Bearer {admin_token}"}
)

# Assert
assert response.status_code == 200
assert isinstance(response.json(), list)
assert all(s["user_id"] == target_user_id for s in response.json())
```

### Test Case 2: Non-admin cannot access
```python
# Setup
user_token = login_as_regular_user()  # role="user"
target_user_id = 74

# Action
response = requests.get(
    f"{BASE_URL}/sessions/user/{target_user_id}",
    headers={"Authorization": f"Bearer {user_token}"}
)

# Assert
assert response.status_code == 403
assert "admins" in response.json()["detail"].lower()
```

### Test Case 3: Admin cannot view own sessions via this endpoint
```python
# Setup
admin_token = login_as_admin()  # id=1
own_user_id = 1

# Action
response = requests.get(
    f"{BASE_URL}/sessions/user/{own_user_id}",
    headers={"Authorization": f"Bearer {admin_token}"}
)

# Assert
assert response.status_code == 400
assert "my-sessions" in response.json()["detail"].lower()
```

### Test Case 4: Non-existent user returns 404
```python
# Setup
admin_token = login_as_admin()
fake_user_id = 999999

# Action
response = requests.get(
    f"{BASE_URL}/sessions/user/{fake_user_id}",
    headers={"Authorization": f"Bearer {admin_token}"}
)

# Assert
assert response.status_code == 404
assert "User not found" in response.json()["detail"]
```

---

## 📊 DEPLOYMENT CHECKLIST

- [ ] Add endpoint to router
- [ ] Add SessionService.get_user_sessions() method
- [ ] Update Session schema/model
- [ ] Add User.role field (if not exists)
- [ ] Run database migrations
- [ ] Test all 4 test cases above
- [ ] Deploy to production
- [ ] Verify endpoint works: `curl {URL}/sessions/user/1`
- [ ] Frontend admin panel works without 404 errors

---

## 🎯 DEADLINE

Frontend is ready to use this endpoint. **Please implement within 24 hours** so admin panel session management feature can go live.

---

## 💬 CONTACT

If unclear:
1. Check `BACKEND_SESSION_ROUTER.py` for complete router code
2. Check `BACKEND_IMPLEMENTATION_NOTES.md` for full documentation
3. Reference the copy-paste code above

---

## 📍 RELATED ENDPOINTS (Already implemented?)

These endpoints should already exist:
- ✅ POST /sessions/create
- ✅ GET /sessions/my-sessions  
- ✅ GET /sessions/session/{id}
- ✅ DELETE /sessions/session/{id}
- ✅ DELETE /sessions/logout-all
- ✅ GET /sessions/active-devices-count

This is a **NEW ENDPOINT** that needs to be added:
- ❌ GET /sessions/user/{user_id} ← **IMPLEMENT THIS**

And this one too:
- ❌ DELETE /sessions/logout ← **IMPLEMENT THIS** (optional but recommended)

---

## 🚀 STATUS

- Frontend: ✅ Ready
- Backend: ❌ Not ready
- Database: ⏳ Check if Session table exists
- Tests: ⏳ Ready to run after implementation

**Blocker:** This endpoint is blocking Admin Panel → Users → Sessions feature
