# 🛠️ Quick Commands & References

## 📋 Quick Access Commands

### View Documentation
```bash
# Start here
cat START_HERE.md

# Navigation guide
cat DOCUMENTATION_INDEX.md

# 5-minute setup
cat QUICK_START.md

# Complete overview
cat README_PREMIUM_SYSTEM.md

# Technical details
cat IMPLEMENTATION_PREMIUM_MODALS.md

# Full reference
cat PREMIUM_IMPLEMENTATION_GUIDE.md

# Visual diagrams
cat VISUAL_IMPLEMENTATION_GUIDE.md

# Testing & deployment
cat COMPLETION_CHECKLIST.md

# Summary report
cat IMPLEMENTATION_SUMMARY.md
```

### View Component Files
```bash
# Welcome modal (147 lines)
cat src/Components/PremiumWelcomeModal.jsx

# Renewal modal (141 lines)
cat src/Components/PremiumRenewalModal.jsx

# Dashboard integration (updated)
cat src/Dashboard.jsx

# Auth integration comments
cat src/Auth.jsx
```

---

## 🗄️ Database Commands

### SQL Schema Updates
```sql
-- Add columns to users table
ALTER TABLE users ADD COLUMN is_new_user BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN premium_duration TIMESTAMP;

-- Add indexes for performance
CREATE INDEX idx_is_new_user ON users(is_new_user);
CREATE INDEX idx_premium_duration ON users(premium_duration);
```

### Testing Commands
```sql
-- Mark user as new (for testing welcome modal)
UPDATE users SET is_new_user = true WHERE id = 'user_id';

-- Set premium to expire tomorrow (for renewal modal testing)
UPDATE users SET premium_duration = NOW() + INTERVAL '1 day' WHERE id = 'user_id';

-- Set premium to expire in 2 days
UPDATE users SET premium_duration = NOW() + INTERVAL '2 days' WHERE id = 'user_id';

-- Check user premium status
SELECT id, username, is_new_user, premium_duration, 
       CASE 
           WHEN premium_duration > NOW() THEN 'ACTIVE'
           ELSE 'EXPIRED'
       END AS status
FROM users WHERE id = 'user_id';
```

---

## 🐍 Python/FastAPI Code Template

### Registration Endpoint
```python
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
import jwt

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register(
    username: str,
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Create user with premium
        now = datetime.utcnow()
        user = User(
            username=username,
            email=email,
            password=hashed_password,
            is_new_user=True,  # ← NEW
            premium_duration=now + timedelta(days=5),  # ← NEW
            created_at=now
        )
        
        # Save to database
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Generate tokens
        access_token = generate_access_token(user.id)
        refresh_token = generate_refresh_token(user.id)
        
        # Return response
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "is_new_user": user.is_new_user,
                "premium_duration": user.premium_duration.isoformat(),
                "created_at": user.created_at.isoformat()
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
```

### User Info Endpoint
```python
@router.get("/user/me")
async def get_current_user(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "is_new_user": current_user.is_new_user,  # ← IMPORTANT
        "premium_duration": current_user.premium_duration.isoformat() if current_user.premium_duration else None,  # ← IMPORTANT
        "created_at": current_user.created_at.isoformat()
    }
```

---

## 🎨 Tailwind Classes Used

### Color Classes
```tailwind
Backgrounds:
  from-indigo-600, via-purple-600, to-pink-500
  bg-white, bg-white/10, bg-white/20
  bg-gray-50, bg-amber-50

Borders:
  border-white/30, border-amber-200

Text:
  text-white, text-white/80, text-white/60
  text-gray-800, text-gray-700, text-gray-600
  text-amber-600, text-yellow-300

Button States:
  hover:bg-white/90, hover:bg-white/30
  hover:shadow-lg
```

### Spacing Classes
```tailwind
Mobile:
  p-6, px-4, py-2, gap-2, mb-4

Tablet/Desktop:
  p-10, px-6, py-3, gap-3, mb-6, md:p-10
```

---

## 🎬 Component Lifecycle

### Mount → Unmount Flow
```javascript
// Mount
useEffect(() => {
  // Prevent scrolling
  document.body.style.overflow = 'hidden';
  
  // Trigger animation
  setTimeout(() => setIsAnimating(true), 100);
  
  // Cleanup on unmount
  return () => {
    document.body.style.overflow = 'unset';
  };
}, []);

// Render
return (
  <div className={`...${isAnimating ? 'opacity-100' : 'opacity-0'}...`}>
    {/* Modal content */}
  </div>
);
```

---

## 📊 State Management Pattern

```javascript
// In Dashboard.jsx
const [showPremiumWelcome, setShowPremiumWelcome] = useState(false);
const [showPremiumRenewal, setShowPremiumRenewal] = useState(false);
const [premiumDaysLeft, setPremiumDaysLeft] = useState(0);

// In useEffect
if (data.is_new_user) {
  setShowPremiumWelcome(true);
  localStorage.setItem(`premium_welcome_shown_${data.id}`, "true");
}

if (isPremiumUser && daysLeft <= 2) {
  setPremiumDaysLeft(daysLeft);
  setShowPremiumRenewal(true);
}

// In JSX
{showPremiumWelcome && <PremiumWelcomeModal ... />}
{showPremiumRenewal && <PremiumRenewalModal ... />}
```

---

## 🧪 Testing Snippets

### JavaScript Testing
```javascript
// Check if modal is visible
const modal = document.querySelector('[role="dialog"]');
console.log("Modal visible:", modal !== null);

// Check animations
console.log("Has animation class:", modal.classList.contains('opacity-100'));

// Get modal state
const state = document.body.style.overflow;
console.log("Body overflow:", state); // Should be 'hidden'
```

### API Testing (curl)
```bash
# Test registration with premium
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }' | jq '.'

# Verify response has premium fields
# Should see: is_new_user: true, premium_duration: "2025-01-17..."

# Test user info endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/user/me | jq '.'
```

---

## 🚀 Deployment Commands

### Build Frontend
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Check Errors
```bash
# Lint
npm run lint

# Check TypeScript (if applicable)
npx tsc --noEmit
```

### Docker Commands (optional)
```bash
# Build image
docker build -t mockstream-client .

# Run container
docker run -p 3000:3000 mockstream-client

# Push to registry
docker push your-registry/mockstream-client:latest
```

---

## 🔍 Debugging Commands

### Check Component Props
```javascript
// In component
console.log("Modal props:", { user, onClose });
console.log("Renewal props:", { daysLeft, onClose });
```

### Check State
```javascript
// In Dashboard
console.log("Premium state:", { 
  showPremiumWelcome, 
  showPremiumRenewal, 
  premiumDaysLeft 
});
```

### Check API Response
```javascript
// In useEffect
const res = await api.get("/user/me");
console.log("User data:", res.data);
console.log("is_new_user:", res.data.is_new_user);
console.log("premium_duration:", res.data.premium_duration);
```

---

## 📱 Browser DevTools

### Chrome DevTools Commands
```javascript
// In Console:

// Check modal visibility
document.querySelector('[role="dialog"]')

// Check CSS classes
document.querySelector('[role="dialog"]').className

// Check animation status
window.getComputedStyle(document.querySelector('[role="dialog"]')).opacity

// Monitor state changes
console.log("Checking component state...")
```

---

## 🎬 Git Commands

### Commit Changes
```bash
# View status
git status

# Add files
git add .

# Commit with message
git commit -m "feat: add premium welcome and renewal modals"

# Push to remote
git push origin main
```

### Create Branch
```bash
# Create new branch
git checkout -b feature/premium-modals

# Make changes...

# Push new branch
git push origin feature/premium-modals
```

---

## 📧 Code Examples

### Import Statement
```javascript
import PremiumWelcomeModal from "./Components/PremiumWelcomeModal";
import PremiumRenewalModal from "./Components/PremiumRenewalModal";
```

### Component Usage
```jsx
<PremiumWelcomeModal
  user={user}
  onClose={() => setShowPremiumWelcome(false)}
/>

<PremiumRenewalModal
  daysLeft={premiumDaysLeft}
  onClose={() => setShowPremiumRenewal(false)}
/>
```

---

## ⚙️ Configuration Values

### Animation Timing
```javascript
// Modal fade-in duration
300ms  // opacity transition

// Modal scale duration
500ms  // transform transition

// Animation trigger delay
100ms  // setTimeout in useEffect

// Total time to full visibility
500ms (largest duration)
```

### Premium Calculation
```javascript
// Days to show renewal modal
daysLeft <= 2

// Premium duration from registration
5 days from now

// Calculation formula
const daysLeft = Math.ceil((premiumEndDate - now) / (1000 * 60 * 60 * 24));
```

### Z-Index Layers
```javascript
z-50:  // Modals (highest)
z-40:  // Tooltips
z-30:  // Dropdowns
z-10:  // Main content
z-0:   // Background (lowest)
```

---

## 📚 Reference Links

### Documentation Files
- START_HERE.md - Main entry point
- DOCUMENTATION_INDEX.md - Navigation guide
- QUICK_START.md - Quick setup
- README_PREMIUM_SYSTEM.md - Complete overview
- IMPLEMENTATION_PREMIUM_MODALS.md - Technical details
- PREMIUM_IMPLEMENTATION_GUIDE.md - Full reference
- VISUAL_IMPLEMENTATION_GUIDE.md - Visual diagrams
- COMPLETION_CHECKLIST.md - Testing & deployment
- IMPLEMENTATION_SUMMARY.md - Summary report

### Component Files
- src/Components/PremiumWelcomeModal.jsx
- src/Components/PremiumRenewalModal.jsx
- src/Dashboard.jsx
- src/Auth.jsx

---

## 🎯 Quick Checklist

Frontend:
- [x] Components created
- [x] Dashboard integrated
- [x] Responsive design
- [x] Animations working
- [x] No console errors

Backend (TODO):
- [ ] Database schema updated
- [ ] /auth/register endpoint updated
- [ ] /user/me endpoint returns new fields
- [ ] API tested
- [ ] Database migrated

Testing (TODO):
- [ ] Welcome modal appears on signup
- [ ] Renewal modal appears when needed
- [ ] All buttons work correctly
- [ ] Navigation works
- [ ] Mobile responsive works
- [ ] No performance issues

Deployment (TODO):
- [ ] Backend deployed
- [ ] Frontend built
- [ ] Tests pass
- [ ] Monitoring enabled
- [ ] Rollback plan ready

---

**Bookmark this file for quick reference during development!**
