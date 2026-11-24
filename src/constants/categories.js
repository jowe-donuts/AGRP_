// Single source of truth for category names.
// `CATEGORIES` drives the report form + filter chips; the two maps are
// derived from it so a new backend enum value is added in exactly one place.

export const CATEGORIES = [
  { label: 'Electronics', value: 'electronics' },
  { label: 'Wallets', value: 'accessory' },
  { label: 'Bags', value: 'bags' },
  { label: 'Keys', value: 'keys' },
  { label: 'IDs & Cards', value: 'document' },
];

// enum -> display label (used when rendering backend items; includes values
// the form doesn't offer so old items keep their labels)
export const CATEGORY_DISPLAY = {
  ...Object.fromEntries(CATEGORIES.map(({ value, label }) => [value, label])),
  clothing: 'Clothing',
  other: 'Other',
};

// display label -> enum (used when submitting a new post)
export const CATEGORY_TO_ENUM = Object.fromEntries(
  CATEGORIES.map(({ value, label }) => [label, value]),
);
