
# Final Verification Checklist

## 1. Digital Career Plan Restoration
- [ ] Verify `DigitalCareerPlanPage.tsx` loads without crashing.
- [ ] Confirm that if API fails, the 7 levels (RS One Star to RS Legend Star) are displayed.
- [ ] Validate that "Salvar Alterações" works (it was already implemented, just ensure no regression).

## 2. Network Tree Interactivity
- [ ] Verify `NetworkTreeView` loads with the Admin Root (d107...) if API fails.
- [ ] Confirm clicking on a consultant card (not just the arrow) expands the node if it has children.
- [ ] Check if the cursor changes to pointer on hover over nodes.

## 3. General
- [ ] Ensure no console errors related to "digital_career_levels" missing table.
- [ ] Clean up temporary scripts (`dump_digital_levels.js`, `dump_digital_levels_correct.js`, `list_tables.js`).
