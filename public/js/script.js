document.addEventListener("DOMContentLoaded", () => {
  const menuTitle = document.querySelectorAll(".menu .title");
  console.log(menuTitle);

  menuTitle.forEach((menu) => {
    console.log(menu);

    menu.addEventListener("click", () => {
      const menuItems = menu.nextElementSibling;
      console.log(menuItems);
      menuItems.style.display =
        menuItems.style.display === "flex" ? "none" : "flex";
    });
  });
});

// close all the other menus.
document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".menu-items .menu-item");
  menuItems.forEach((menuItem) => {
    // console.log(menuItem);
    menuItem.addEventListener("click", () => {
      if (menuItem.getAttribute("onClick") == "manageTests()") {
        document.querySelector(".admin-control .addTest").style.display =
          "none";
      }

      if (menuItem.getAttribute("onClick") == "addTestForm()") {
        document.querySelector(".manage-tests").style.display = "none";
      }
    });
  });
});

// Add test menu

function addTestForm() {
  const addTest = document.querySelector(".admin-control .addTest");
  addTest.style.display = "block";
}
// Manage test
function manageTests() {
  // Replace the URL in the address bar without reloading the page
  history.replaceState(null, null, "/admin-dashboard");

  const manageTests = document.querySelector(".manage-tests");
  manageTests.style.display = "grid";
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  // Show the "Add Test" form if `showAddTest` is true
  if (params.get("showAddTest") === "true") {
    const addTest = document.querySelector(".admin-control .addTest");
    if (addTest) {
      addTest.style.display = "block";
    }
  }

  // Display the success message if `message` exists
  const message = params.get("message");
  if (message) {
    const messageContainer = document.querySelector(".message-container");
    if (messageContainer) {
      alert(message);
      messageContainer.style.display = "block";
    }
    // Hide the message after 5 seconds
    setTimeout(() => {
      messageContainer.style.display = "none";
    }, 5000);
  }
});

// Delete test
function deleteTest(id) {
  console.log(id);
  fetch(`/delete-test/${id}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      if (data.success) {
        // Set flag to indicate reload is required
        localStorage.setItem("reloadRequired", "true");
        location.reload(); // Reload the page to reflect changes
      }
    })
    .catch((error) => console.error("Error:", error));
}

// Check for the reload flag and show the grid after reload
document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("reloadRequired") === "true") {
    document.querySelector(".manage-tests").style.display = "grid"; // Show the grid
    localStorage.removeItem("reloadRequired"); // Reset the flag
  }
});
