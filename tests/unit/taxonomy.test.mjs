import test from 'node:test';
import assert from 'node:assert/strict';
import { useFake } from '../support/helpers.mjs';
import { loadTaxonomies, applyTaxonomies } from '../../src/services/taxonomyService.js';
import { categories, categoryById } from '../../src/data/categories.js';
import { countries, countryById } from '../../src/data/countries.js';
import { adminResources } from '../../src/pages/admin/adminResources.js';
import * as admin from '../../src/services/adminService.js';

test('taxonomies loaded from the database refresh the shared lists in place', async () => {
  const { fake, signIn } = useFake({ admins: ['boss@example.test'] });
  await signIn('boss@example.test', { admin: true });
  const listRef = categories;
  const mapRef = categoryById;
  const first = fake.__tables.categories[0];
  await admin.updateRow(adminResources.categories, first.id, { title: { en: 'Renamed by admin', sw: 'Imebadilishwa' } });
  await loadTaxonomies();
  assert.equal(categories, listRef, 'same array object, so existing imports see the change');
  assert.equal(categoryById, mapRef);
  assert.equal(categoryById[first.id].title.en, 'Renamed by admin');
  assert.equal(categories.length, fake.__tables.categories.length);
  assert.equal(countries.length, fake.__tables.countries.length);
  assert.ok(countryById.israel);
});

test('applyTaxonomies ignores empty responses so the bundled lists remain a fallback', () => {
  const before = categories.length;
  applyTaxonomies({ categories: [], countries: [], applications: [], sectors: [] });
  assert.equal(categories.length, before);
});
