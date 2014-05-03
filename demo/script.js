window.addEventListener('load', function() {
  // Initiate the table handling script on the current window
  Table.load(window);

  // Deselect table(s) when clicking away
  document.addEventListener('click', function() {
    // The click_select component has its exported methods in Table.clickSelect
    Table.clickSelect.deselect();
  });
});
