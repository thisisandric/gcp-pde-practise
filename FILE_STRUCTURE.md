# Project File Structure

```
gcp-pde-platform/
│
├── app/
│   ├── components/
│   │   ├── Header.tsx              # Top navigation bar
│   │   ├── Sidebar.tsx             # Left sidebar with references
│   │   ├── Quiz.tsx                # Main quiz logic & navigation
│   │   ├── QuestionCard.tsx        # Individual question display
│   │   └── ResultsCard.tsx         # Final results & analytics
│   │
│   ├── data/
│   │   └── quiz.ts                 # ALL quiz questions, options, references, explanations
│   │
│   ├── globals.css                 # Global Tailwind styles
│   ├── layout.tsx                  # Root layout with metadata
│   └── page.tsx                    # Main app page
│
├── public/                          # Static assets (empty for now)
│
├── .gitignore                      # Git ignore rules
├── README.md                       # Full documentation
├── DEPLOY.md                       # 5-minute deployment guide ⭐
├── FILE_STRUCTURE.md               # This file
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript config
├── tailwind.config.ts              # Tailwind theme config
├── postcss.config.js               # PostCSS config for Tailwind
└── next.config.ts                  # Next.js config
```

## Key Files Explained

### `app/data/quiz.ts`
**Contains:** All quiz questions, options, explanations, best practices, and references
- 20 quiz questions with 4 options each
- 32 reference documents organized by topic
- Explanations for each answer
- Best practice tips
- Links to external resources

### `app/components/Quiz.tsx`
**Handles:** Quiz flow, scoring, navigation between questions
- Question sequencing
- Answer validation
- Score calculation
- Topic-wise analytics

### `app/components/QuestionCard.tsx`
**Displays:** Individual question with options and feedback
- Question rendering
- Option selection UI
- Answer feedback (correct/incorrect)
- Reference links
- Explanation display

### `app/components/Sidebar.tsx`
**Navigation:** Reference materials organized by topic
- Category grouping
- Search/filter capabilities
- Selection highlighting
- Mobile responsiveness

### `app/components/Header.tsx`
**Top Bar:** Navigation and progress info
- Quiz title
- Progress percentage
- Menu toggle for mobile

### `app/components/ResultsCard.tsx`
**Final Screen:** Score, analytics, and recommendations
- Percentage score
- Topic-wise breakdown
- Performance recommendations
- Restart button

### `app/page.tsx`
**Main App:** Routes between quiz and references
- State management
- Component orchestration
- Reference view logic

---

## Content Organization

### Quiz Questions Structure
```typescript
{
  id: 1,
  question: "Question text",
  topic: "BigQuery",
  difficulty: "medium",
  options: [
    { text: "Option A", correct: false },
    { text: "Option B", correct: true },
    // ... more options
  ],
  explanation: "Why option B is correct",
  bestPractice: "Production tip...",
  references: ["bq-pricing", "bq-slots"] // Links to reference docs
}
```

### Reference Documents Structure
```typescript
{
  id: "bq-pricing",
  title: "BigQuery Pricing Models",
  category: "BigQuery",
  content: "Long-form explanation...",
  keyPoints: [
    "Point 1",
    "Point 2"
  ],
  externalLink: "https://cloud.google.com/..."
}
```

---

## Adding Content

### Add a New Question
1. Open `app/data/quiz.ts`
2. Add to `quizQuestions` array with unique ID
3. Reference existing reference IDs in `references` field
4. Save and deploy

### Add a New Reference
1. Open `app/data/quiz.ts`
2. Add to `references` array with unique ID
3. Ensure ID is used in question `references` field
4. Save and deploy

### Modify Styling
1. Edit `tailwind.config.ts` for color scheme
2. Edit `app/globals.css` for custom styles
3. Components use Tailwind classes directly

---

## Development Workflow

```bash
# Start local dev server
npm run dev

# Open http://localhost:3000

# Make changes
# → Components auto-reload
# → Hot module reloading enabled

# Test quiz, references, navigation
# → Changes visible immediately

# When ready to deploy:
git add .
git commit -m "Update content"
git push

# → Vercel auto-deploys to production
# → Deployments visible at vercel.com dashboard
```

---

## Customization Guide

### Change Quiz Topic
Edit `app/data/quiz.ts` - Replace all questions with your domain

### Change Color Scheme
Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      clay: '#D9A584',  // Primary color
    }
  }
}
```

### Change Quiz Length
Edit `app/data/quiz.ts` - Add/remove questions from array

### Add Categories
Edit `app/components/Sidebar.tsx` - Filter by category in dropdown

---

## Performance Notes

- **Image Optimization**: Uses Next.js Image component (not in current design)
- **Code Splitting**: Each component lazy-loaded
- **CSS**: Tailwind purges unused styles (~50 KB production)
- **Fonts**: System fonts used (no external font requests)
- **Dark Mode**: CSS variables for theme switching

---

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Deployment Checklist

- [ ] Test locally: `npm run dev`
- [ ] Test quiz flow (all 20 questions)
- [ ] Test mobile responsiveness
- [ ] Test dark mode toggle
- [ ] Verify all reference links
- [ ] Check for TypeScript errors
- [ ] Push to GitHub
- [ ] Verify Vercel deployment
- [ ] Test production URL
- [ ] Share with friends! 🎉

---

Need help? See `DEPLOY.md` for 5-minute deployment or `README.md` for full docs.
