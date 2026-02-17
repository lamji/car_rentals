const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const knowledgeDir = path.join(rootDir, ".ai-knowledge");

const allowedExactFiles = new Set([
  "architecture-map.md",
  "api-delegation.md",
  "logging-protocol.md",
  "CHANGELOG.md",
  "global-layout-components.md",
]);

const allowedPatternChecks = [
  {
    name: "implementation review",
    pattern: /^implementation-review-[a-z0-9-]+\.md$/,
    needsTimestamp: true,
  },
  {
    name: "api schema",
    pattern: /^api-data-schema-[a-z0-9-]+\.md$/,
    needsTimestamp: false,
  },
  {
    name: "changelog archive",
    pattern: /^CHANGELOG-\d{4}\.md$/,
    needsTimestamp: false,
  },
  {
    name: "dated root note",
    pattern: /^\d{4}-\d{2}-\d{2}-[A-Z]+-[A-Za-z0-9-]+\.md$/,
    needsTimestamp: false,
  },
];

const historyPattern = /^\d{4}-\d{2}-\d{2}-[A-Z]+-[A-Za-z0-9-]+\.md$/;

function getFirstLine(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return raw.split(/\r?\n/, 1)[0].trim();
}

function main() {
  if (!fs.existsSync(knowledgeDir)) {
    console.error(`Missing directory: ${knowledgeDir}`);
    process.exit(1);
  }

  const entries = fs
    .readdirSync(knowledgeDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  const historyDir = path.join(knowledgeDir, "history");
  const historyEntries = fs.existsSync(historyDir)
    ? fs
        .readdirSync(historyDir, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
    : [];

  const errors = [];

  for (const fileName of entries) {
    if (allowedExactFiles.has(fileName)) {
      continue;
    }

    const matchedRule = allowedPatternChecks.find((rule) =>
      rule.pattern.test(fileName)
    );

    if (!matchedRule) {
      errors.push(
        `Invalid filename: ${fileName}. Expected implementation-review-<feature>.md or api-data-schema-<endpoint>.md (or approved base docs).`
      );
      continue;
    }

    if (matchedRule.needsTimestamp) {
      const filePath = path.join(knowledgeDir, fileName);
      const firstLine = getFirstLine(filePath);
      if (!/^Time:\s+\d{1,2}:\d{2}\s+(AM|PM)/.test(firstLine)) {
        errors.push(
          `Missing/invalid timestamp in ${fileName}. First line must match: Time: h:mm AM/PM`
        );
      }
    }
  }

  for (const fileName of historyEntries) {
    if (!historyPattern.test(fileName)) {
      errors.push(
        `Invalid history filename: ${fileName}. Expected YYYY-MM-DD-TYPE-Component-Description.md`
      );
    }
  }

  if (errors.length > 0) {
    console.error("AI knowledge validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `AI knowledge validation passed. Checked ${entries.length} root file(s) and ${historyEntries.length} history file(s).`
  );
}

main();
