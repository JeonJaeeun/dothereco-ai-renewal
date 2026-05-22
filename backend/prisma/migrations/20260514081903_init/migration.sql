-- CreateTable
CREATE TABLE "FixedSchedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "endTime" TEXT,
    "title" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'fixed',
    "color" TEXT,
    "textColor" TEXT,
    "lat" REAL,
    "lng" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FlexibleTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "tag" TEXT NOT NULL,
    "dday" TEXT,
    "durationMinutes" INTEGER,
    "priority" TEXT,
    "placeMode" TEXT,
    "placeKeyword" TEXT,
    "place" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "textColor" TEXT,
    "lat" REAL,
    "lng" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "request" TEXT,
    "strategy" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "reasons" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
