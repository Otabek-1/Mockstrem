# File Upload Feature - ListeningMockForm.jsx

## Overview

The **Listening Mock Form** now supports bulk importing exam data from CSV or JSON files. This feature allows administrators to quickly populate complex listening exam forms with multiple parts instead of manually entering each field.

---

## Supported File Formats

### 1. CSV Format (Recommended for simplicity)

Use pipe-delimited (`|`) format with section headers.

**File Extension:** `.csv` or `.txt`

#### CSV Structure:

```
[TITLE]
Your Mock Test Title

[AUDIOS]
part_1|https://example.com/audio1.mp3
part_2|https://example.com/audio2.mp3
part_3|https://example.com/audio3.mp3
part_4|https://example.com/audio4.mp3
part_5|https://example.com/audio5.mp3
part_6|https://example.com/audio6.mp3

[PART1]
Option1|Option2|Option3|A
Option1|Option2|Option3|B
Option1|Option2|Option3|C
Option1|Option2|Option3|A
Option1|Option2|Option3|B
Option1|Option2|Option3|C
Option1|Option2|Option3|A
Option1|Option2|Option3|B

[PART2]
label|Train Schedule|before|Next train leaves at|after|sharp|answer|10:30
label|Restaurant Hours|before|We open at|after|daily|answer|9am
label|Library Hours|before|Closes at|after|weekends|answer|5pm
label|Flight Gate|before|Boarding at gate|after|now|answer|12
label|Room Number|before|Meeting in room|after|floor|answer|204
label|Store Opens|before|We open at|after|today|answer|8am

[PART3]
speakers|John;Mary;David;Sarah
options|Doctor;Teacher;Engineer;Driver;Manager;Chef
answers|A;B;C;D

[PART4]
mapUrl|https://example.com/map.jpg
mapLabels|A;B;C;D;E;F;G;H;I
question1|place|Museum|answer|A
question2|place|Library|answer|B
question3|place|Hospital|answer|C
question4|place|Station|answer|D
question5|place|Park|answer|E

[PART5]
extract1|text|Interview with CEO|q1_question|What is her background?|q1_options|Medicine;Law;Business|q1_answer|C|q2_question|Years of experience?|q2_options|5;10;15|q2_answer|B
extract2|text|Business Meeting|q1_question|What is the topic?|q1_options|Sales;Marketing;Finance|q1_answer|A|q2_question|Next steps?|q2_options|Report;Analysis;Plan|q2_answer|C
extract3|text|Travel Planning|q1_question|Where going?|q1_options|Paris;London;Rome|q1_answer|B|q2_question|When travel?|q2_options|Summer;Winter;Spring|q2_answer|A

[PART6]
before|The project|after|completed on time|answer|was
before|We should|after|our responsibilities|answer|take
before|Technology has|after|our lives|answer|changed
before|Students must|after|attention in class|answer|pay
before|The company will|after|new services|answer|launch
before|We need to|after|the situation|answer|improve
```

---

### 2. JSON Format (Advanced - more structured)

Use JSON for complex nested data structures.

**File Extension:** `.json`

#### JSON Structure:

```json
{
  "title": "CEFR Listening Mock Test 2024",
  "audios": {
    "part_1": "https://example.com/audio1.mp3",
    "part_2": "https://example.com/audio2.mp3",
    "part_3": "https://example.com/audio3.mp3",
    "part_4": "https://example.com/audio4.mp3",
    "part_5": "https://example.com/audio5.mp3",
    "part_6": "https://example.com/audio6.mp3"
  },
  "part1": [
    { "options": ["Paris", "London", "Berlin"], "answer": "A" },
    { "options": ["Monday", "Tuesday", "Wednesday"], "answer": "B" },
    { "options": ["Coffee", "Tea", "Water"], "answer": "C" },
    { "options": ["Option1", "Option2", "Option3"], "answer": "A" },
    { "options": ["Option1", "Option2", "Option3"], "answer": "B" },
    { "options": ["Option1", "Option2", "Option3"], "answer": "C" },
    { "options": ["Option1", "Option2", "Option3"], "answer": "A" },
    { "options": ["Option1", "Option2", "Option3"], "answer": "B" }
  ],
  "part2": [
    {
      "label": "Train departures",
      "before": "The next train to Manchester leaves at",
      "after": "and arrives at 14:30",
      "answer": "12:45"
    },
    {
      "label": "Restaurant hours",
      "before": "We are open from",
      "after": "Monday to Friday",
      "answer": "11am"
    }
  ],
  "part3": {
    "speakers": ["John", "Mary", "David", "Sarah"],
    "options": ["Working in IT", "Teaching English", "Managing a hotel", "Selling cars", "Writing books", "Cooking professionally"],
    "answers": ["A", "B", "C", "D"]
  },
  "part4": {
    "mapUrl": "https://example.com/map.jpg",
    "mapLabels": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
    "questions": [
      { "place": "Museum", "answer": "A" },
      { "place": "Library", "answer": "B" },
      { "place": "Hospital", "answer": "C" },
      { "place": "Train Station", "answer": "D" },
      { "place": "Park", "answer": "E" }
    ]
  },
  "part5": [
    {
      "text": "Extract 1: Interview with a scientist",
      "q1": {
        "question": "What is the scientist's main research area?",
        "options": ["Climate change", "Space exploration", "Medicine"],
        "answer": "A"
      },
      "q2": {
        "question": "How long has she been working in this field?",
        "options": ["5 years", "10 years", "15 years"],
        "answer": "B"
      }
    }
  ],
  "part6": [
    {
      "before": "The new policy will",
      "after": "all employees starting next month",
      "answer": "affect"
    },
    {
      "before": "We must",
      "after": "our responsibilities seriously",
      "answer": "take"
    }
  ]
}
```

---

## How to Use

1. **Prepare Your Data File**
   - Create a CSV or JSON file with your listening mock exam questions
   - Use one of the templates provided: `LISTENING_MOCK_TEMPLATE.csv` or `LISTENING_MOCK_TEMPLATE.json`

2. **Upload the File**
   - Navigate to the "Create Listening Mock" form
   - Find the "📁 Fayldan Yuklash (JSON/CSV)" section at the top
   - Click the file input and select your CSV or JSON file

3. **Auto-Population**
   - All form fields will be automatically populated with data from the file
   - If the file is missing some parts, empty fields will be filled with default values
   - The form retains its structure (8 questions for Part 1, 6 for Part 2, etc.)

4. **Review and Edit**
   - Check the populated data for accuracy
   - Make any necessary edits or additions
   - Review all answer keys carefully

5. **Submit**
   - Click "Save & Submit" to save the listening mock test to the database
   - The system will save both the questions and answer keys

---

## CSV Format Details

### Part-by-Part Breakdown:

#### **[TITLE]** Section
```
[TITLE]
Your Mock Test Title Here
```
Single line with the test title.

#### **[AUDIOS]** Section
```
[AUDIOS]
part_1|https://url-to-audio1.mp3
part_2|https://url-to-audio2.mp3
...
part_6|https://url-to-audio6.mp3
```
Format: `part_N|audio_url`  
URLs should be fully qualified (http/https).

#### **[PART1]** Section - Multiple Choice
```
[PART1]
Option1|Option2|Option3|A
Apple|Banana|Cherry|B
...
```
Format: `option1|option2|option3|answer`  
8 lines total (one per question)

#### **[PART2]** Section - Sentence Completion
```
[PART2]
label|Train Schedule|before|Train leaves at|after|sharp|answer|10:30
label|Store Hours|before|Opens at|after|daily|answer|9am
...
```
Format: `label|label_text|before|before_text|after|after_text|answer|answer_text`  
6 lines total

#### **[PART3]** Section - Speaker Matching
```
[PART3]
speakers|John;Mary;David;Sarah
options|Doctor;Teacher;Engineer;Driver;Manager;Chef
answers|A;B;C;D
```
- Speakers separated by `;` (4 speakers)
- Options separated by `;` (6 options)
- Answers separated by `;` (4 answers, one per speaker)

#### **[PART4]** Section - Map Labeling
```
[PART4]
mapUrl|https://example.com/map.jpg
mapLabels|A;B;C;D;E;F;G;H;I
question1|place|Museum|answer|A
question2|place|Library|answer|B
...
```
- Map URL to the image
- Labels separated by `;`
- 5 questions with format: `questionN|place|place_name|answer|answer_label`

#### **[PART5]** Section - Extracts
```
[PART5]
extract1|text|Interview Title|q1_question|Q1 Text|q1_options|Opt1;Opt2;Opt3|q1_answer|A|q2_question|Q2 Text|q2_options|Opt1;Opt2;Opt3|q2_answer|B
extract2|text|Meeting|...
extract3|text|Discussion|...
```
All data on ONE LINE per extract.  
Format: `extractN|text|text_value|q1_question|q_text|q1_options|opt1;opt2;opt3|q1_answer|ans|q2_question|...|q2_options|...|q2_answer|ans`

#### **[PART6]** Section - Lecture Completion
```
[PART6]
before|The project|after|completed on time|answer|was
before|Students should|after|attention in class|answer|pay
...
```
Format: `before|before_text|after|after_text|answer|answer_word`  
6 lines total

---

## Example Files

Two template files are provided in the root directory:

1. **LISTENING_MOCK_TEMPLATE.csv** - CSV format example
2. **LISTENING_MOCK_TEMPLATE.json** - JSON format example

Copy these files and customize them with your own data.

---

## Tips & Best Practices

✅ **Do's:**
- Use UTF-8 encoding for your files
- Test with one section first (just [TITLE] and [PART1])
- Keep audio URLs on HTTPS for security
- Use consistent formatting and delimiters
- Validate your answers before saving

❌ **Don'ts:**
- Don't use pipes (`|`) in your text content (will break CSV parsing)
- Don't use semicolons (`;`) in option text (will break list parsing)
- Don't leave required fields empty
- Don't forget the section headers (`[PART1]`, `[PART2]`, etc.)
- Don't mix CSV and JSON formats in one file

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Fayl parse qilishda xato" | Check file format, ensure valid JSON or CSV structure |
| Fields not populated | Verify section headers match exactly: `[TITLE]`, `[AUDIOS]`, `[PART1]`, etc. |
| Missing audio | Check audio URLs are complete and accessible |
| Part 5 not loading | Ensure all 6 fields per extract are present, use single line format |
| CSV not recognized | Check file extension is `.csv` or `.txt` |

---

## Technical Details

### File Parser Architecture

The parsing system uses two main functions:

1. **`parseFileContent(content, filename)`**
   - Routes to JSON or CSV parser based on file extension
   - Handles errors with user-friendly messages

2. **`parseCSV(csvContent)`**
   - Line-by-line parser with section detection
   - Validates data structure and required fields
   - Maps CSV values to form state objects

### Data Structure

The parser returns an object with this structure:
```javascript
{
  title: String,
  audios: { part_1: String, part_2: String, ..., part_6: String },
  part1: Array<{options: String[], answer: String}>,
  part2: Array<{label, before, after, answer}>,
  part3: {speakers: String[], options: String[], answers: String[]},
  part4: {mapUrl: String, mapLabels: String[], questions: Array},
  part5: Array<{text, q1: {...}, q2: {...}}>,
  part6: Array<{before, after, answer}>
}
```

---

## Support

For issues or feature requests, contact the development team with:
- Your file content (or a sample)
- Error message shown
- Browser console errors (F12)
- Expected vs. actual behavior
