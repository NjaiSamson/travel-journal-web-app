document.addEventListener("DOMContentLoaded", function () {
  const postForm = document.querySelector(".post-form");
  const postButton = document.getElementById("post");
  const postContainer = document.getElementById("post-container");
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

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

      editSection.appendChild(editButton);
      editSection.appendChild(deleteButton);

      userPost.appendChild(locationDetails);
      userPost.appendChild(userPhoto);
      userPost.appendChild(postInfo);
      userPost.appendChild(postDescription);
      userPost.appendChild(editSection);

      postContainer.appendChild(userPost);
  }

  function handleDelete(postId, postElement) {
      fetch(`http://localhost:3000/posts/${postId}`, {
          method: "DELETE"
      })
      .then(response => {
          if (response.ok) {
              alert("Post deleted successfully");
              postElement.remove();
          } else {
              throw new Error("Failed to delete post");
          }
      })
      .catch(error => {
          console.error("Error deleting post:", error);
          alert("Error deleting post");
      });
  }

  function fetchData() {
      fetch("http://localhost:3000/posts")
      .then(response => response.json())
      .then(data => {
          data.forEach(postData => {
              renderUserPost(postData);
          });
      })
      .catch(error => {
          console.error("Error fetching data:", error);
          alert("Error fetching data");
      });
  }

  fetchData();
});
