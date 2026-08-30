// Default habits + option lists. The live habit list is persisted through
// Storage.getHabits(), which seeds this default set on first run.
// icon values are Lucide icon names (rendered via the Lucide CDN).
window.HabitApp = window.HabitApp || {};

window.HabitApp.DEFAULT_HABITS = [
  { id: 'sleep',   label: 'Sleep',   icon: 'bed',        color: '#a78bfa' },
  { id: 'food',    label: 'Food',    icon: 'utensils',   color: '#fb923c' },
  { id: 'walk',    label: 'Walk',    icon: 'footprints', color: '#34d399' },
  { id: 'read',    label: 'Read',    icon: 'book-open',  color: '#60a5fa' },
  { id: 'workout', label: 'Workout', icon: 'dumbbell',   color: '#f87171' },
  { id: 'water',   label: 'Water',   icon: 'droplet',    color: '#22d3ee' },
];

// Icons offered in the "Add habit" picker.
window.HabitApp.ICON_CHOICES = [
  'bed', 'utensils', 'footprints', 'book-open', 'dumbbell', 'droplet',
  'heart', 'brain', 'moon', 'sun', 'coffee', 'apple',
  'bike', 'music', 'pencil', 'code', 'leaf', 'smile',
  'sprout', 'glass-water', 'salad', 'pill', 'guitar', 'palette',
];
