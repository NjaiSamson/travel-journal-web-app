document.addEventListener("DOMContentLoaded", function () {
  const postForm = document.querySelector(".post-form");
  const postButton = document.getElementById("post");
  const postContainer = document.getElementById("post-container");
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  const homeLink = document.getElementById("home-link");
  const favoriteLink = document.getElementById("favorite-link");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");

  let postsData = [];
  let favoritePosts = [];

  postButton.addEventListener("click", function () {
    postForm.classList.toggle("show");
  });

  menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("show");
  });

  homeLink.addEventListener("click", function () {
    renderPosts(postsData);
  });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const query = searchInput.value.toLowerCase();
    const filteredPosts = postsData.filter(post =>
      post.placeName.toLowerCase().includes(query) ||
      post.cityName.toLowerCase().includes(query) ||
      post.countryName.toLowerCase().includes(query)
    );
    renderPosts(filteredPosts);
  });

  postForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(postForm);
    const fileInput = document.getElementById("photo");
    const file = fileInput.files[0];

    const reader = new FileReader();
    reader.onloadend = function () {
      const base64String = reader.result.split(",")[1];
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
          postsData.push(data);
          renderPosts(postsData);
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

  function renderPosts(posts) {
    postContainer.innerHTML = "";
    posts.forEach(post => {
      const userPost = document.createElement("div");
      userPost.classList.add("user-post");
      userPost.dataset.postId = post.id;

      const locationDetails = document.createElement("div");
      locationDetails.classList.add("location-details");

      const placeName = document.createElement("h2");
      placeName.textContent = `Destination: ${post.placeName}`;
      const cityCountry = document.createElement("h4");
      cityCountry.textContent = `${post.cityName}, ${post.countryName}`;

      locationDetails.appendChild(placeName);
      locationDetails.appendChild(cityCountry);

      const userPhoto = document.createElement("div");
      userPhoto.classList.add("user-photo");
      const img = document.createElement("img");
      img.src = post.photo;
      userPhoto.appendChild(img);

      const postDescription = document.createElement("div");
      postDescription.classList.add("post-description");
      const h33 = document.createElement('h3');
      h33.textContent = `Comments.`
      postDescription.appendChild(h33);
      const comments = document.createElement("p");
      comments.textContent = post.comments;
      postDescription.appendChild(comments);

      const editSection = document.createElement("div");
      editSection.classList.add("edit-section");

      const editButton = document.createElement("button");
      editButton.classList.add("edit-btn");
      editButton.textContent = "Edit";
      editButton.addEventListener("click", function () {
        showEditForm(post);
      });

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-btn");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", function () {
        deletePost(post.id);
      });

      const favoriteButton = document.createElement("button");
      favoriteButton.classList.add("favorite-btn");
      favoriteButton.textContent = "Favorite";
      favoriteButton.addEventListener("click", function () {
        toggleFavorite(post);
      });

      editSection.appendChild(editButton);
      editSection.appendChild(deleteButton);
      editSection.appendChild(favoriteButton);

      userPost.appendChild(locationDetails);
      userPost.appendChild(userPhoto);
      userPost.appendChild(postDescription);
      userPost.appendChild(editSection);

      postContainer.appendChild(userPost);
    });
  }

  function deletePost(postId) {
    fetch(`http://localhost:3000/posts/${postId}`, {
      method: "DELETE"
    })
      .then(response => {
        if (response.ok) {
          postsData = postsData.filter(post => post.id !== postId);
          renderPosts(postsData);
        } else {
          alert("Error deleting post");
        }
      })
      .catch(error => {
        console.error("Error deleting post:", error);
        alert("Error deleting post");
      });
  }

  function toggleFavorite(post) {
    if (favoritePosts.includes(post.id)) {
      favoritePosts = favoritePosts.filter(id => id !== post.id);
    } else {
      favoritePosts.push(post.id);
    }
    renderPosts(postsData);
  }

  function showEditForm(post) {
    const editForm = document.createElement("form");
    editForm.classList.add("edit-form");

    const placeNameLabel = document.createElement("label");
    placeNameLabel.textContent = "Place Name:";
    const placeNameInput = document.createElement("input");
    placeNameInput.classList.add("edit-input");
    placeNameInput.type = "text";
    placeNameInput.value = post.placeName;

    const countryNameLabel = document.createElement("label");
    countryNameLabel.textContent = "Country Name:";
    const countryNameInput = document.createElement("input");
    countryNameInput.classList.add("edit-input");
    countryNameInput.type = "text";
    countryNameInput.value = post.countryName;

    const cityNameLabel = document.createElement("label");
    cityNameLabel.textContent = "City Name:";
    const cityNameInput = document.createElement("input");
    cityNameInput.classList.add("edit-input");
    cityNameInput.type = "text";
    cityNameInput.value = post.cityName;

    const photoLabel = document.createElement("label");
    photoLabel.textContent = "Photo:";
    const photoInput = document.createElement("input");
    photoInput.classList.add("edit-input");
    photoInput.type = "file";
    photoInput.accept = "image/*";

    const commentsLabel = document.createElement("label");
    commentsLabel.textContent = "Comments:";
    const commentsTextarea = document.createElement("textarea");
    commentsTextarea.classList.add("edit-textarea");
    commentsTextarea.value = post.comments;

    const saveButton = document.createElement("button");
    saveButton.classList.add("edit-btn");
    saveButton.textContent = "Save";
    saveButton.type = "submit";

    editForm.appendChild(placeNameLabel);
    editForm.appendChild(placeNameInput);
    editForm.appendChild(countryNameLabel);
    editForm.appendChild(countryNameInput);
    editForm.appendChild(cityNameLabel);
    editForm.appendChild(cityNameInput);
    editForm.appendChild(photoLabel);
    editForm.appendChild(photoInput);
    editForm.appendChild(commentsLabel);
    editForm.appendChild(commentsTextarea);
    editForm.appendChild(saveButton);

    editForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const updatedPost = {
        placeName: placeNameInput.value,
        countryName: countryNameInput.value,
        cityName: cityNameInput.value,
        comments: commentsTextarea.value,
      };

      const file = photoInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = function () {
          updatedPost.photo = `data:${file.type};base64,${reader.result.split(",")[1]}`;
          updatePost(post.id, updatedPost);
        };
        reader.readAsDataURL(file);
      } else {
        updatedPost.photo = post.photo;
        updatePost(post.id, updatedPost);
      }
    });

    const userPost = document.querySelector(`.user-post[data-post-id="${post.id}"]`);
    userPost.appendChild(editForm);
  }

  function updatePost(postId, updatedPost) {
    fetch(`http://localhost:3000/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedPost)
    })
      .then(response => response.json())
      .then(data => {
        postsData = postsData.map(post => (post.id === postId ? data : post));
        renderPosts(postsData);
      })
      .catch(error => {
        console.error("Error updating post:", error);
        alert("Error updating post");
      });
  }

  // Fetch initial posts
  fetch("http://localhost:3000/posts")
    .then(response => response.json())
    .then(data => {
      postsData = data;
      renderPosts(postsData);
    })
    .catch(error => {
      console.error("Error fetching posts:", error);
    });
});
