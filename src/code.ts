// Import tokens
import { lightTokens } from './lightTokens';
import { darkTokens } from './darkTokens';

// Define selected Frame(s)
const selectedFrames = figma.currentPage.selection;

// Skip invisible stuff
figma.skipInvisibleInstanceChildren = true;

// Die if no Frame is selected
if (!selectedFrames[0]) {
  figma.notify("Select one or more Frames to experience the magic! ⚠️");
  figma.closePlugin();
} else {

  // Die if things other than Frames are selected
  selectedFrames.forEach(selectedFrame => {
    if (selectedFrame.parent && selectedFrame.parent.type === 'PAGE' && selectedFrame.type === 'FRAME') {

      // Clone selected Frame
      selectedFrame.clone();

      // Find all Frames in the current page
      const pageChildren = figma.currentPage.children;

      // Iterate over all page children to find x position for each
      let largest = 0;
      const y = selectedFrame.y;

      pageChildren.forEach(child => {
        if (child.y === y && largest < child.x) {
          largest = child.x;
        }
      });

      // Move clone 40px to the right of the last child in the same row
      selectedFrame.x = largest + selectedFrame.width + 40;

      // Find all instances within clone
      const instances = selectedFrame.findAll((n: { type: string; }) => n.type === "INSTANCE");
      let fillStyle = selectedFrame.fillStyleId;
      let strokeStyle;
      let currentTheme = '';
      let newName;
      let name = selectedFrame.name;

      // Set currentTheme value
      const setTheme = (theme: any, newTheme: any) => {
        currentTheme = theme.toLowerCase();
        if (name.match(/light/i)) {
          newName = name.replace(/light/gi, newTheme);
        } else if (name.match(/dark/i)) {
          newName = name.replace(/dark/gi, newTheme);
        } else {
          newName = name + ' / ' + newTheme;
        }
        selectedFrame.name = newName;
      }

      // Check current theme
      instances.every(instance => {
        if (instance.type === 'INSTANCE') {
          if ('Theme' in instance.componentProperties
            && instance.componentProperties.Theme.value === 'Light') {
              setTheme('Light', 'Dark');
              return false;
          }
          if ('Theme' in instance.componentProperties
            && instance.componentProperties.Theme.value === 'Dark') {
              setTheme('Dark', 'Light');
              return false;
          }
          return true;
        }
      });

      // Recursive function to traverse all child nodes
      const mapTokens = (e: any) => {
        if (e.type === 'INSTANCE') {
          if ('Theme' in e.componentProperties && currentTheme === 'light') {
            e.setProperties({ 'Theme': 'Dark' });
          }
          if ('Theme' in e.componentProperties && currentTheme === 'dark') {
            e.setProperties({ 'Theme': 'Light' });
          }
        }

        if (e.type !== 'INSTANCE') {
          fillStyle = e.fillStyleId;
          strokeStyle = e.strokeStyleId;
          if (currentTheme === 'light') {
            for (const light in lightTokens) {
              if (fillStyle !== '' && light === fillStyle) {
                e.fillStyleId = lightTokens[light].mapsTo;
              }
              if (strokeStyle !== '' && light === strokeStyle) {
                e.strokeStyleId = lightTokens[light].mapsTo;
              }
            }
          }
          if (currentTheme === 'dark') {
            for (const dark in darkTokens) {
              if (fillStyle !== '' && dark === fillStyle) {
                e.fillStyleId = darkTokens[dark].mapsTo;
              }
              if (strokeStyle !== '' && dark === strokeStyle) {
                e.strokeStyleId = darkTokens[dark].mapsTo;
              }
            }
          }
        }

        if (e.type === 'GROUP'
        || e.type === 'FRAME') {
          for (const child in e.children) {
            mapTokens(e.children[child]);
          }
        }
      }

      // Check for and replace fill color on the selected Frame
      mapTokens(selectedFrame);

      // Iterate through children of selected Frame
      for (const child in selectedFrame.children) {
        mapTokens(selectedFrame.children[child]);
      }

      figma.viewport.scrollAndZoomIntoView(selectedFrames);

      let run = async () => {
        // Success notice and close plugin
        figma.notify("Theme magic! ✨");
        figma.closePlugin();
      }
      
      run();
    } else {
      figma.notify("Invalid selection! The magic only works on page level Frames. ⚠️");
      figma.closePlugin();
    }
  });

}
