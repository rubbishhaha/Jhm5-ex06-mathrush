-- create table for dataset
CREATE TABLE IF NOT EXISTS exam_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  no TEXT,
  description TEXT,
  type TEXT,
  day_school_candidates_no INTEGER,
  day_school_candidates_cumulative INTEGER,
  all_candidates_no INTEGER,
  all_candidates_cumulative INTEGER
);
