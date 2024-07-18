document.addEventListener("DOMContentLoaded", function () {
  const postForm = document.querySelector(".post-form");
  const postButton = document.getElementById("post");
  const postContainer = document.getElementById("post-container");
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const homeLink = document.getElementById("home-link"); // Updated home link
  const favoriteLink = document.getElementById("favorite-link"); // Favorite link

  let favoritePosts = [];

  postButton.addEventListener("click", function () {
      postForm.classList.toggle("show");
  });

  menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("show");
  });

  postForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(postForm);
      const fileInput = document.getElementById("photo");
      const file = fileInput.files[0];

      const reader = new FileReader();
      reader.onloadend = function () {
          const base64String = reader.result.split(',')[1];
          const postData = {
              placeName: formData.get("placeName"),
              countryName: formData.get("countryName"),
              cityName: formData.get("cityName"),
              photo: `data:${file.type};base64,${base64String}`,
              comments: formData.get("comments")
          };

          fetch("http://localhost:3000/posts", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify(postData)
          })
          .then(response => response.json())
          .then(data => {
              alert("Post created successfully");
              renderUserPost(data);
              postForm.reset();
              postForm.classList.remove("show");
          })
          .catch(error => {
              console.error("Error posting data:", error);
              alert("Error posting data");
          });
      };

      if (file) {
          reader.readAsDataURL(file);
      } else {
          alert("Please upload a photo.");
      }
  });

  function renderUserPost(postData) {
      const userPost = document.createElement("div");
      userPost.classList.add("user-post");
      userPost.dataset.postId = postData.id; // Assuming your postData includes an 'id'

      const locationDetails = document.createElement("div");
      locationDetails.classList.add("location-details");

      const placeName = document.createElement("h3");
      placeName.textContent = postData.placeName;

      const destinationLocation = document.createElement("p");
      destinationLocation.textContent = `${postData.cityName}, ${postData.countryName}`;

      locationDetails.appendChild(placeName);
      locationDetails.appendChild(destinationLocation);

      const userPhoto = document.createElement("div");
      userPhoto.classList.add("user-photo");

      const img = document.createElement("img");
      img.classList.add("images");
      img.src = postData.photo;

      userPhoto.appendChild(img);

      const postInfo = document.createElement("div");
      postInfo.classList.add("post-info");

      const postDescription = document.createElement("div");
      postDescription.classList.add("post-description");

      const comments = document.createElement("p");
      comments.textContent = postData.comments;

      postDescription.appendChild(comments);

      const editSection = document.createElement("div");
      editSection.classList.add("edit-section");

      const editButton = document.createElement("button");
      editButton.classList.add("buttons");
      editButton.textContent = "Edit";
      editButton.addEventListener("click", function () {
          handleEdit(postData, userPost);
      });

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("buttons");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
          handleDelete(postData.id, userPost);
      });

      const favoriteButton = document.createElement("button");
      favoriteButton.classList.add("buttons");
      favoriteButton.textContent = "Favorite";
      favoriteButton.addEventListener("click", function () {
          toggleFavorite(postData);
      });

      if (favoritePosts.some(post => post.id === postData.id)) {
          favoriteButton.textContent = "Unfavorite";
      }

      editSection.appendChild(editButton);
      editSection.appendChild(deleteButton);
      editSection.appendChild(favoriteButton);

      userPost.appendChild(locationDetails);
      userPost.appendChild(userPhoto);
      userPost.appendChild(postInfo);
      userPost.appendChild(postDescription);
      userPost.appendChild(editSection);

      postContainer.appendChild(userPost);
  }

  function handleEdit(postData, postElement) {
      // Remove any existing edit form
      const existingEditForm = postElement.nextElementSibling;
      if (existingEditForm && existingEditForm.classList.contains("edit-form")) {
          existingEditForm.remove();
          return;
      }

      // Create edit form
      const editForm = createEditForm(postData);

      // Insert edit form below the postElement
      postElement.parentNode.insertBefore(editForm, postElement.nextSibling);
  }

  function createEditForm(postData) {
      const editForm = document.createElement("form");
      editForm.classList.add("edit-form");

      const placeNameInput = createInput("placeName", "Place Name", postData.placeName);
      const countryNameInput = createInput("countryName", "Country Name", postData.countryName);
      const cityNameInput = createInput("cityName", "City Name", postData.cityName);
      const commentsInput = createTextarea("comments", "Comments", postData.comments);

      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.textContent = "Update";

      editForm.appendChild(placeNameInput);
      editForm.appendChild(countryNameInput);
      editForm.appendChild(cityNameInput);
      editForm.appendChild(commentsInput);
      editForm.appendChild(submitButton);

      return editForm;
  }

  function createInput(id, label, value) {
      const labelElement = document.createElement("label");
      labelElement.for = id;
      labelElement.textContent = `${label}:`;

      const inputElement = document.createElement("input");
      inputElement.type = "text";
      inputElement.id = id;
      inputElement.name = id;
      inputElement.value = value;
      inputElement.required = true;
      inputElement.classList.add("edit-input"); // Adding edit-input class for styling

      const container = document.createElement("div");
      container.appendChild(labelElement);
      container.appendChild(inputElement);

      return container;
  }

  function createTextarea(id, label, value) {
      const labelElement = document.createElement("label");
      labelElement.for = id;
      labelElement.textContent = `${label}:`;

      const textareaElement = document.createElement("textarea");
      textareaElement.id = id;
      textareaElement.name = id;
      textareaElement.textContent = value;
      textareaElement.required = true;
      textareaElement.classList.add("edit-textarea"); // Adding edit-textarea class for styling

      const container = document.createElement("div");
      container.appendChild(labelElement);
      container.appendChild(textareaElement);

      return container;
  }

  function handleDelete(postId, postElement) {
      fetch(`http://localhost:3000/posts/${postId}`, {
          method: "DELETE",
          headers: {
              "Content-Type": "application/json"
          }
      })
      .then(response => {
          if (response.ok) {
              alert("Post deleted successfully");
              postElement.remove();
              // Remove from favorite posts if deleted
              favoritePosts = favoritePosts.filter(post => post.id !== postId);
          } else {
              throw new Error("Failed to delete post");
          }
      })
      .catch(error => {
          console.error("Error deleting post:", error);
          alert("Error deleting post");
      });
  }

  function toggleFavorite(postData) {
      const index = favoritePosts.findIndex(post => post.id === postData.id);

      if (index === -1) {
          favoritePosts.push(postData);
      } else {
          favoritePosts.splice(index, 1);
      }

      renderPosts();
  }

  function renderPosts() {
      postContainer.innerHTML = "";
      const postsToRender = favoriteLink.classList.contains("active") ? favoritePosts : postsData;
      postsToRender.forEach(postData => renderUserPost(postData));
  }

  // Event listener for home link
  homeLink.addEventListener("click", function (event) {
      event.preventDefault();
      favoriteLink.classList.remove("active");
      renderPosts();
  });

  // Event listener for favorite link
  favoriteLink.addEventListener("click", function (event) {
      event.preventDefault();
      favoriteLink.classList.add("active");
      renderPosts();
  });

  function fetchData() {
      fetch("http://localhost:3000/posts")
      .then(response => response.json())
      .then(data => {
          postsData = data; // Assuming postsData is a global variable to store all posts
          renderPosts();
      })
      .catch(error => {
          console.error("Error fetching data:", error);
          alert("Error fetching data");
      });
  }

  fetchData();
});
