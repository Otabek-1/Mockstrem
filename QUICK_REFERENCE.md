# File Upload Quick Reference

## CSV vs JSON

| Feature | CSV | JSON |
|---------|-----|------|
| **Simplicity** | ⭐⭐⭐⭐⭐ Easy | ⭐⭐⭐ Medium |
| **Readability** | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐ Good |
| **Structured Data** | Limited | ⭐⭐⭐⭐⭐ Excellent |
| **Delimiter Risk** | Use pipes (\|) | Safe |
| **Recommended for** | Quick tests | Complex configs |

---

## CSV Delimiters (Important!)

```
Field separator:     | (pipe)
List separator:      ; (semicolon)
Key-value pairs:     label|value|before|value|after|value
```

**Example:**
```
label|Train Time|before|Leaves at|after|sharp|answer|10:30
```

---

## Minimal CSV Template

```
[TITLE]
My Test

[AUDIOS]
part_1|https://example.com/audio1.mp3

[PART1]
A|B|C|A
A|B|C|B
A|B|C|C
A|B|C|A
A|B|C|B
A|B|C|C
A|B|C|A
A|B|C|B

[PART2]
label|Q1|before|Text|after|more|answer|ans
label|Q2|before|Text|after|more|answer|ans
label|Q3|before|Text|after|more|answer|ans
label|Q4|before|Text|after|more|answer|ans
label|Q5|before|Text|after|more|answer|ans
label|Q6|before|Text|after|more|answer|ans

[PART3]
speakers|Person1;Person2;Person3;Person4
options|Job1;Job2;Job3;Job4;Job5;Job6
answers|A;B;C;D

[PART4]
mapUrl|https://example.com/map.jpg
mapLabels|A;B;C;D;E
question1|place|Place1|answer|A
question2|place|Place2|answer|B
question3|place|Place3|answer|C
question4|place|Place4|answer|D
question5|place|Place5|answer|E

[PART5]
extract1|text|Extract 1|q1_question|Q1?|q1_options|A;B;C|q1_answer|A|q2_question|Q2?|q2_options|A;B;C|q2_answer|B
extract2|text|Extract 2|q1_question|Q1?|q1_options|A;B;C|q1_answer|A|q2_question|Q2?|q2_options|A;B;C|q2_answer|B
extract3|text|Extract 3|q1_question|Q1?|q1_options|A;B;C|q1_answer|A|q2_question|Q2?|q2_options|A;B;C|q2_answer|B

[PART6]
before|Text|after|more|answer|word
before|Text|after|more|answer|word
before|Text|after|more|answer|word
before|Text|after|more|answer|word
before|Text|after|more|answer|word
before|Text|after|more|answer|word
```

---

## Part Requirements

| Part | Questions | Format |
|------|-----------|--------|
| **Part 1** | 8 | Multiple choice (3 options each) |
| **Part 2** | 6 | Sentence completion |
| **Part 3** | 4 | Speaker matching (4 speakers, 6 jobs) |
| **Part 4** | 5 | Map labeling |
| **Part 5** | 3 extracts × 2 questions | Multiple choice extracts |
| **Part 6** | 6 | Lecture completion |

---

## Common Errors & Fixes

### Error: "Fayl parse qilishda xato"

**Cause:** Invalid format  
**Fix:** 
- Check section headers: `[TITLE]`, `[PART1]`, etc.
- Count questions per part
- Verify pipe and semicolon usage

### Error: Fields empty after upload

**Cause:** Missing section or wrong format  
**Fix:**
- Add missing `[PART#]` headers
- Ensure each line has correct number of fields
- Use correct delimiters

### Error: Part 5 not loading

**Cause:** Multi-line format (should be single line)  
**Fix:**
- Keep all extract data on ONE LINE
- Format: `extractN|text|...|q1_question|...|q1_answer|...|q2_question|...|q2_answer|...`

---

## File Format Rules

### Required Structure
```
✓ Every file needs [TITLE] section
✓ Every file needs [AUDIOS] section (can be empty)
✓ Add sections for parts you want to populate
✓ Parts don't need to be complete (extras auto-filled)
```

### CSV-Specific Rules
```
✓ Use | to separate fields
✓ Use ; to separate list items
✓ Use field|value|field|value format for key-value pairs
✓ NO pipes or semicolons inside your text!
```

### Valid Line Examples
```
Part 1:   Option1|Option2|Option3|A
Part 2:   label|Train|before|Leaves|after|sharp|answer|10am
Part 3:   speakers|John;Mary;David;Sarah
Part 4:   question1|place|Museum|answer|A
Part 5:   extract1|text|Interview|q1_question|Q1?|q1_options|A;B;C|q1_answer|A|q2_question|Q2?|q2_options|A;B;C|q2_answer|B
Part 6:   before|Project|after|complete|answer|was
```

---

## Advanced: Minimal JSON Example

```json
{
  "title": "Test",
  "audios": {"part_1": "https://example.com/audio.mp3"},
  "part1": [
    {"options": ["A", "B", "C"], "answer": "A"},
    {"options": ["A", "B", "C"], "answer": "B"},
    {"options": ["A", "B", "C"], "answer": "C"},
    {"options": ["A", "B", "C"], "answer": "A"},
    {"options": ["A", "B", "C"], "answer": "B"},
    {"options": ["A", "B", "C"], "answer": "C"},
    {"options": ["A", "B", "C"], "answer": "A"},
    {"options": ["A", "B", "C"], "answer": "B"}
  ]
}
```

---

## Workflow

1. **Create file** (CSV or JSON)
2. **Add [TITLE]** section
3. **Add [AUDIOS]** section
4. **Add [PART1]** to [PART6]** sections
5. **Validate** - Check count and format
6. **Upload** to form
7. **Review** populated data
8. **Adjust** as needed
9. **Save**

---

## File Locations

- **CSV Template:** `LISTENING_MOCK_TEMPLATE.csv`
- **JSON Template:** `LISTENING_MOCK_TEMPLATE.json`
- **Documentation:** `FILE_UPLOAD_GUIDE.md` (this file)

Copy templates and customize!

---

**Last Updated:** 2024  
**Supported Formats:** CSV, JSON, TXT  
**Form:** ListeningMockForm.jsx
