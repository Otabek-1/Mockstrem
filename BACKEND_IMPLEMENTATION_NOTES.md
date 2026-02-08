# 🔧 BACKEND IMPLEMENTATION NOTES

## ✅ O'ZGARTIRISHLAR

### 1️⃣ **YANGI ENDPOINT: DELETE /sessions/logout**
```python
@router.delete("/logout")
async def logout_current_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
)
```

**Frontend qo'llanush:**
```javascript
// src/api.js
function logoutUser() {
  try {
    api.delete("/sessions/logout").catch(() => {});  // ← YO'Q CALL
  } catch (err) {
    console.warn("Could not notify backend of logout", err);
  }
  
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/auth";
}
```

**Qanday ishlaydi:**
1. User logout button click → `logoutUser()` chaqiriladi
2. DELETE /sessions/logout → Backend sessionni yopadi
3. localStorage tokens clear → Client-side cleanup
4. Redirect → /auth page

---

### 2️⃣ **YANGI ENDPOINT: GET /sessions/user/{user_id}**
```python
@router.get("/user/{user_id}", response_model=List[SessionResponse])
async def get_user_sessions_admin(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
)
```

**Frontend qo'llanush:**
```javascript
// src/Admin/Users.jsx
const fetchUserSessions = async (userId) => {
  try {
    setSessionsLoading(true)
    const response = await api.get(`/sessions/user/${userId}`)
    // ← THIS ENDPOINT (newly added)
    setUserSessions(Array.isArray(response.data) ? response.data : [])
    setShowSessionsModal(true)
  } catch (error) {
    // ...
  }
}
```

**Qanday ishlaydi:**
1. Admin panel -> Users -> "Sessions" button
2. GET /sessions/user/{userId} → Backend query user sessions
3. Response: User-ning barcha active sessions-lari
4. Modal display: Device info + IP + last activity

---

## 📋 IMPLEMENTATION CHECKLIST

### SessionService Methods (kerak bo'lgan)
- [x] `create_session()` - CREATE
- [x] `get_user_sessions()` - READ user's sessions
- [x] `get_session_by_id()` - READ single session
- [x] `delete_session()` - DELETE single session
- [x] `delete_all_user_sessions()` - DELETE all sessions
- [x] `get_session_count()` - COUNT active sessions
- [x] `enforce_max_sessions()` - ENFORCE max device limit

### Database Model (Session table)
```python
class Session(Base):
    __tablename__ = "sessions"
    
    id: int (PK)
    user_id: int (FK)
    device_fingerprint: str (unique per device)
    device_name: str (e.g., "Chrome on Windows")
    device_type: str ("mobile" or "web")
    browser: str (e.g., "Chrome", "Safari")
    ip_address: str
    created_at: datetime
    last_activity: datetime
    is_active: bool (default: True)
```

### Schema (SessionCreate, SessionResponse)
```python
class SessionCreate(BaseModel):
    device_fingerprint: str
    device_name: str
    device_type: str  # "mobile" or "web"
    browser: str
    ip_address: str

class SessionResponse(BaseModel):
    id: int
    user_id: int
    device_name: str
    device_type: str
    browser: str
    ip_address: str
    created_at: datetime
    last_activity: datetime
    is_active: bool
```

---

## 🔐 SECURITY CONSIDERATIONS

### Permission Checks
```python
✅ DELETE /sessions/logout
   - No special permission needed
   - User can only close is own session
   - Token is still valid during call

✅ GET /sessions/user/{user_id}
   - ADMIN ONLY
   - Check: current_user.role == "admin"
   - Cannot view own sessions via this endpoint
   - Use /my-sessions instead

✅ DELETE /sessions/session/{session_id}
   - User can only delete is own session
   - Check: session.user_id == current_user.id
```

### Device Fingerprint
```python
# Frontend generates unique fingerprint for device
# Backend should validate consistency

# Current issue: Frontend generates NEW fingerprint on every load
# Solution: Persist fingerprint in localStorage

# Then: Check if fingerprint matches when creating new session
if device_fingerprint_exists:
    # Treat as same device (update session)
    update_existing_session()
else:
    # New device
    create_new_session()
```

---

## 🧪 TESTING GUIDE

### Test 1: Logout closes session
```bash
1. Login → GET /sessions/create → session stored
2. Click logout → DELETE /sessions/logout
3. Check DB: session.is_active = false
4. ✅ PASS if session marked inactive
```

### Test 2: Admin can view user sessions
```bash
1. Login as admin
2. Admin panel → Users → Click "Sessions"
3. GET /sessions/user/{targetUserId}
4. ✅ PASS if sessions displayed
```

### Test 3: Non-admin cannot view other sessions
```bash
1. Login as regular user
2. Try: GET /sessions/user/999
3. ✅ PASS if 403 Forbidden
```

### Test 4: User cannot view own sessions via admin endpoint
```bash
1. Login as admin (id=1)
2. Try: GET /sessions/user/1
3. ✅ PASS if 400 Bad Request (use /my-sessions instead)
```

---

## 📊 ENDPOINT REFERENCE

| Endpoint | Method | Auth | Admin | Purpose |
|----------|--------|------|--------|---------|
| /sessions/create | POST | ✅ | - | Create new session |
| /sessions/my-sessions | GET | ✅ | - | Get my active sessions |
| /sessions/session/{id} | GET | ✅ | - | Get session details |
| /sessions/session/{id} | DELETE | ✅ | - | Logout from device |
| /sessions/logout | DELETE | ✅ | - | Close current session (NEW) |
| /sessions/logout-all | DELETE | ✅ | - | Logout from all devices |
| /sessions/active-devices-count | GET | ✅ | - | Count active devices |
| /sessions/user/{id} | GET | ✅ | ✅ | Get user sessions (ADMIN) (NEW) |

---

## 🔄 REQUEST/RESPONSE FLOW

### 1. LOGIN → CREATE SESSION
```
CLIENT:
POST /auth/login
{
  "email": "user@email.com",
  "password": "xxxxx"
}

SERVER:
✅ Authenticate user
  Return: { access_token, refresh_token, user }

CLIENT:
  Store tokens in localStorage
  Call: createSession()
  POST /sessions/create
  {
    "device_fingerprint": "abc123",
    "device_name": "Chrome on Windows 10",
    "device_type": "web",
    "browser": "Chrome",
    "ip_address": "192.168.1.1"
  }

SERVER:
  Enforce max 3 sessions
  Create new session record
  Return: { id, user_id, created_at, ... }

CLIENT:
  Redirect to /dashboard
```

### 2. ADMIN VIEWS USER SESSIONS
```
ADMIN CLIENT:
GET /sessions/user/{userId}

SERVER:
  ✅ Check: current_user.role == "admin"
  ✅ Check: request.user_id != target_user_id
  Query all active sessions for target user
  Return: [{ id, device_name, browser, ip, last_activity, ... }]

ADMIN CLIENT:
  Display modal with sessions list
```

### 3. USER LOGOUT
```
CLIENT:
logoutUser()
  → DELETE /sessions/logout
  
SERVER:
  ✅ Find latest active session for user_id
  Mark session as inactive
  Return: { success: true }

CLIENT:
  Clear localStorage tokens
  Redirect to /auth
```

---

## ⚠️ POTENTIAL ISSUES

### Issue 1: Logout without token still needed
**Problem:** Frontend calls DELETE /sessions/logout BEFORE clearing tokens
**Solution:** ✅ Already handled - endpoint needs valid token (via Depends)

### Issue 2: Multiple logout calls
**Problem:** Frontend button clicked twice
**Solution:** Disable button after click, or check if session already inactive

### Issue 3: Device fingerprint not persisted
**Problem:** Frontend generates NEW fingerprint on page reload
**Solution:** Save to localStorage as `device_fingerprint` key

### Issue 4: Admin cannot see own sessions via /user/{id}
**Problem:** Security - admin endpoint shouldn't allow self-view
**Solution:** ✅ Check: `if user_id == current_user.id: raise error`

---

## 🚀 DEPLOYMENT NOTES

### Database migrations
```sql
-- IF table doesn't exist
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  user_id INTEGER NOT NULL,
  device_fingerprint VARCHAR(255),
  device_name VARCHAR(255),
  device_type VARCHAR(20),  -- "mobile" or "web"
  browser VARCHAR(100),
  ip_address VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_device (user_id, device_fingerprint)
);

CREATE INDEX idx_user_active ON sessions(user_id, is_active);
CREATE INDEX idx_created_at ON sessions(created_at);
```

### Environment variables (if needed)
```
MAX_SESSIONS_PER_USER=3
SESSION_TIMEOUT_HOURS=720  # 30 days
REQUIRE_DEVICE_FINGERPRINT=true
```

### Logging
```python
# Add to SessionService
- Log session creation: "New session for user {id}"
- Log session deletion: "Session {id} deleted"
- Log logout-all: "User {id} logged out from all devices ({count})"
- Log failed login attempts
```

---

## 📚 RELATED FILES

- Frontend: `src/Auth.jsx` - login/register + createSession()
- Frontend: `src/Admin/Users.jsx` - admin panel sessions view
- Frontend: `src/Components/Profile.jsx` - user sessions view
- Backend: `auth/auth.py` - token verification
- Backend: `database/session_model.py` - Session ORM model
- Backend: `services/session_service.py` - Business logic
- Backend: `schemas/session_schema.py` - Pydantic models

---

## ✅ SUMMARY

**Added 2 new endpoints:**
1. ✅ DELETE /sessions/logout - Close current session
2. ✅ GET /sessions/user/{user_id} - Admin view user sessions

**Frontend integration:**
- ✅ logoutUser() calls DELETE /sessions/logout
- ✅ Admin sessions modal calls GET /sessions/user/{id}

**Security:**
- ✅ Admin check for /user/{id} endpoint
- ✅ User can only access own sessions
- ✅ Token-based permission validation
