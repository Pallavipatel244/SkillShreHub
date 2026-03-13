const API_BASE = "http://localhost:8082";
let postToDelete = null;
let deleteBtnRef = null;


/* ================= LOGIN ================= */
function login() {

const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value.trim();

if (!email || !password) {
alert("Email and password required");
return;
}

fetch(`${API_BASE}/auth/login`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({email,password})
})
.then(res=>{
if(!res.ok) throw new Error("Invalid email or password");
return res.json();
})
.then(user=>{

localStorage.setItem("token",user.token);
localStorage.setItem("userId",user.id);
localStorage.setItem("userName",user.name);
localStorage.setItem("userEmail",user.email);

window.location.href="feed.html";

})
.catch(err=>alert(err.message));

}


/* ================= REGISTER ================= */
function register(){

const name = document.getElementById("name").value.trim();
const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value.trim();
const role = document.querySelector('input[name="role"]:checked').value;
const image = document.getElementById("profileImage").files[0];

const emailError = document.getElementById("emailError");

const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

if(!email.match(emailPattern)){
emailError.innerText="Please enter a valid email address";
return;
}else{
emailError.innerText="";
}

if(!name || !password){
alert("Name and password required");
return;
}

const formData = new FormData();

formData.append("name",name);
formData.append("email",email);
formData.append("password",password);
formData.append("role",role);

if(image){
formData.append("image",image);
}

fetch(`${API_BASE}/auth/register`,{
method:"POST",
body:formData
})
.then(res=>{
if(!res.ok) throw new Error("Registration failed");
return res.json();
})
.then(()=>{
alert("Registration successful! Login now.");
window.location.href="login.html";
})
.catch(err=>alert(err.message));

}


/* ================= CHECK LOGIN ================= */
function checkLogin(){
if(!localStorage.getItem("userId")){
window.location.href="login.html";
}
}


/* ================= LOGOUT ================= */
function logout(){
localStorage.clear();
window.location.href="login.html";
}


/* ================= CREATE POST ================= */
function createPost(){

const title=document.getElementById("title").value.trim();
const content=document.getElementById("content").value.trim();
const topic=document.getElementById("topic").value.trim();
const image=document.getElementById("image").files[0];

if(!title && !content && !image){
alert("Please write something or upload an image");
return;
}

const userId=localStorage.getItem("userId");

if(!userId){
alert("User not logged in");
return;
}

const formData=new FormData();

formData.append("title",title);
formData.append("content",content);
formData.append("topic",topic);
formData.append("postType",image ? "image" : "Discussion");

if(image){
formData.append("image",image);
}

fetch(`${API_BASE}/posts/create/${userId}`,{
method:"POST",
body:formData
})
.then(res=>res.json())
.then(post=>{

addPostToFeed(post,true);

document.getElementById("title").value="";
document.getElementById("content").value="";
document.getElementById("topic").value="";
document.getElementById("image").value="";

document.getElementById("imagePreview").innerHTML="";

})
.catch(err=>alert(err.message));

}


/* ================= LOAD FEED ================= */
function loadPosts(){

fetch(`${API_BASE}/posts/feed`)
.then(res => {

if(!res.ok){
throw new Error("API error");
}

return res.json();

})
.then(posts=>{

const postsDiv=document.getElementById("posts");

/* clear only when data is received */
postsDiv.innerHTML="";

posts.reverse().forEach(post=>{
addPostToFeed(post);
});


})
.catch(err=>{

console.error(err);

/* do NOT delete existing posts */
const postsDiv=document.getElementById("posts");

if(postsDiv.innerHTML.trim()===""){
postsDiv.innerHTML="<p style='color:red'>Failed to load posts</p>";
}

});

}


/* ================= ADD POST TO FEED ================= */
function addPostToFeed(post,prepend=false){

const postsDiv=document.getElementById("posts");

const div=document.createElement("div");

div.classList.add("post-card");

const archiveButton = post.archived
? `<button onclick="restorePost(${post.id})">♻ Restore</button>`
: `<button onclick="archivePost(${post.id})">📦 Archive</button>`;

div.innerHTML = `

<div class="post-header">

<div class="user-info">

<div class="avatar">
${post.user.profileImage ?
`<img src="${API_BASE}${post.user.profileImage}" class="avatar-img"/>`
:
post.user.name.charAt(0)
}
</div>

<div>
<b>${post.user.name}</b>
<div class="post-time">${new Date(post.createdAt).toLocaleString()}</div>
</div>

</div>

<div class="post-menu">

<button class="menu-btn" onclick="toggleMenu(this,event)">⋮</button>

<div class="menu-dropdown">
<button onclick="openEditModal(${post.id})">✏️ Edit</button>
${archiveButton}

<button onclick="deletePost(${post.id},this,event)">🗑 Delete</button>
</div>

</div>

</div>

<div class="post-title">${post.title || ""}</div>

<div class="post-content">${post.content || ""}</div>

${post.imageUrl ? `<img src="${API_BASE}${post.imageUrl}" class="post-image"/>` : ""}

<div class="post-topic"># ${post.topic || ""}</div>
<div class="post-actions">

<button class="like-btn" onclick="toggleLike(${post.id},this)">
♡
</button>

<button class="action-btn">
💬
</button>

</div>
<div class="post-stats">

<span id="likes${post.id}" class="likes-count">
${post.likeCount} Likes
</span>

<span id="commentCount${post.id}" class="comment-count">
0 Comments
</span>

</div>

<div id="comments${post.id}" class="comment-list"></div>

<div class="comment-input">

<input 
type="text"
id="comment${post.id}"
placeholder="Add a comment..."
onkeypress="if(event.key==='Enter'){addComment(${post.id})}"
>

<button onclick="addComment(${post.id})">
Post
</button>

</div>
`;

let likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];

const likeBtn = div.querySelector(".like-btn");

if(likeBtn && likedPosts.includes(post.id)){
likeBtn.classList.add("liked");
likeBtn.innerText = "♥";
}
if(prepend){
postsDiv.prepend(div);
}else{
postsDiv.appendChild(div);
}

loadComments(post.id);
if(post.archived){
div.classList.add("archived");
}
}
/* ================= LIKE POST ================= */
function toggleLike(postId,btn){

let likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];

const likesSpan = document.getElementById(`likes${postId}`);

let currentLikes = parseInt(likesSpan.innerText);

if(likedPosts.includes(postId)){

/* UNLIKE */

fetch(`${API_BASE}/posts/unlike/${postId}`,{
method:"PUT"
})
.then(res=>res.json())
.then(()=>{

likedPosts = likedPosts.filter(id => id !== postId);

localStorage.setItem("likedPosts",JSON.stringify(likedPosts));

btn.classList.remove("liked");
btn.innerText = "♡";

likesSpan.innerText = (currentLikes - 1) + " Likes";

});

}else{

/* LIKE */

fetch(`${API_BASE}/posts/like/${postId}`,{
method:"POST"
})
.then(res=>res.json())
.then(()=>{

likedPosts.push(postId);

localStorage.setItem("likedPosts",JSON.stringify(likedPosts));

btn.classList.add("liked");
btn.innerText = "♥";

likesSpan.innerText = (currentLikes + 1) + " Likes";

});

}

}
/* ================= COMMENTS ================= */
function addComment(postId){

const text=document.getElementById(`comment${postId}`).value.trim();

if(!text){
alert("Comment cannot be empty");
return;
}

const userId=localStorage.getItem("userId");

fetch(`${API_BASE}/comments/create/${postId}/${userId}`,{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({text})
})
.then(res=>res.json())
.then(()=>{
document.getElementById(`comment${postId}`).value="";
loadComments(postId);
});

}

function loadComments(postId){

fetch(`${API_BASE}/comments/post/${postId}`)
.then(res=>res.json())
.then(data=>{

let html="";

data.forEach(c=>{
html += `
<div class="comment-item">

<div class="comment-avatar">
${c.user.name.charAt(0)}
</div>

<div class="comment-content">

<span class="comment-user">
${c.user.name}
</span>

<span class="comment-text">
${c.text}
</span>

</div>

</div>
`;

});

/* update comments */
document.getElementById(`comments${postId}`).innerHTML = html;

/* update comment counter */
const count = data.length;

document.getElementById(`commentCount${postId}`).innerText =
count === 1 ? "1 Comment" : count + " Comments";

});

}

/* ================= PAGE LOAD ================= */
window.onload=function(){

if(document.getElementById("posts")){
checkLogin();
loadPosts();
}

};


/* ================= SEARCH POSTS ================= */

const searchInput=document.querySelector(".search");

if(searchInput){

searchInput.addEventListener("input",function(){

const keyword=this.value.toLowerCase();

document.querySelectorAll(".post-card").forEach(post=>{

const text=post.innerText.toLowerCase();

post.style.display=text.includes(keyword) ? "block" : "none";

});

});

}


/* ================= PROFILE IMAGE PREVIEW ================= */

document.addEventListener("DOMContentLoaded",function(){

const profileInput=document.getElementById("profileImage");

if(profileInput){

profileInput.addEventListener("change",function(){

const file=this.files[0];

if(file){

const reader=new FileReader();

reader.onload=function(e){
document.getElementById("profilePreview").src=e.target.result;
};

reader.readAsDataURL(file);

}

});

}

});


/* ================= PASSWORD TOGGLE ================= */

function togglePassword(){

const passwordField=document.getElementById("password");

if(passwordField.type==="password"){
passwordField.type="text";
}else{
passwordField.type="password";
}

}
document.getElementById("image").addEventListener("change",function(){

const file=this.files[0];

if(!file) return;

const reader=new FileReader();

reader.onload=function(e){

document.getElementById("imagePreview").innerHTML=`

<div class="preview-box">

<img src="${e.target.result}" class="preview-img">

<span class="remove-img" onclick="removeImage()">✖</span>

</div>

`;

};

reader.readAsDataURL(file);

});

function removeImage(){

document.getElementById("image").value="";
document.getElementById("imagePreview").innerHTML="";

}
function deletePost(postId,btn,event){

event.stopPropagation();   // prevents menu closing issue

postToDelete = postId;
deleteBtnRef = btn;

document.getElementById("deleteModal").style.display="flex";

}

function confirmDelete(){

fetch(`${API_BASE}/posts/delete/${postToDelete}`,{
method:"DELETE"
})
.then(()=>{

const postCard = deleteBtnRef.closest(".post-card");
postCard.remove();

closeDeleteModal();

})
.catch(()=>alert("Failed to delete post"));

}
function closeDeleteModal(){
document.getElementById("deleteModal").style.display="none";
}

function toggleMenu(btn,event){

event.stopPropagation();

const dropdown = btn.nextElementSibling;

/* close other menus */

document.querySelectorAll(".menu-dropdown").forEach(menu=>{
if(menu !== dropdown){
menu.style.display="none";
}
});

/* toggle current */

dropdown.style.display =
dropdown.style.display === "block" ? "none" : "block";

}
function archivePost(postId){

fetch(`${API_BASE}/posts/archive/${postId}`,{
method:"PUT"
})
.then(res=>res.json())
.then(()=>{

/* remove archived post from feed */

const postCard = document
.querySelector(`button[onclick="toggleLike(${postId},this)"]`)
?.closest(".post-card");

if(postCard){
postCard.remove();
}

})
.catch(()=>alert("Failed to archive post"));

}
function restorePost(postId){

fetch(`${API_BASE}/posts/restore/${postId}`,{
method:"PUT"
})
.then(res=>res.json())
.then(()=>{

loadPosts(); // reload feed

})
.catch(()=>alert("Failed to restore post"));

}

function restorePost(postId){

fetch(`${API_BASE}/posts/restore/${postId}`,{
method:"PUT"
})
.then(res=>res.json())
.then(()=>{

loadPosts(); // reload feed

})
.catch(()=>alert("Failed to restore post"));

}
function editPost(postId,btn){

const postCard = btn.closest(".post-card");

const title = postCard.querySelector(".post-title");
const content = postCard.querySelector(".post-content");
const topic = postCard.querySelector(".post-topic");

const oldTitle = title.textContent;
const oldContent = content.textContent;
const oldTopic = topic.textContent.replace('#','');

title.innerHTML =
`<input class="edit-input" id="editTitle${postId}" value="${oldTitle}">`;

content.innerHTML =
`<textarea class="edit-textarea" id="editContent${postId}">${oldContent}</textarea>`;

topic.innerHTML =
`<input class="edit-input" id="editTopic${postId}" value="${oldTopic}">`;

/* replace only the edit button */

btn.outerHTML = `
<button onclick="saveEdit(${postId},this)">💾 Save</button>
<button onclick="cancelEdit(${postId},this,'${oldTitle}','${oldContent}','${oldTopic}')">❌ Cancel</button>
`;

}
function loadArchivedPosts(){

const postsDiv = document.getElementById("posts");

postsDiv.innerHTML = "<h2 style='margin-bottom:20px'>📦 Archived Posts</h2>";

fetch(`${API_BASE}/posts/archived`)
.then(res => res.json())
.then(posts => {

if(posts.length === 0){
postsDiv.innerHTML += "<p>No archived posts</p>";
return;
}

posts.forEach(post=>{
addPostToFeed(post);
});

})
.catch(()=>alert("Failed to load archived posts"));

}
function saveEdit(postId,btn){

const title = document.getElementById(`editTitle${postId}`).value;
const content = document.getElementById(`editContent${postId}`).value;
const topic = document.getElementById(`editTopic${postId}`).value;

fetch(`${API_BASE}/posts/edit/${postId}`,{
method:"PUT",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
title:title,
content:content,
topic:topic
})
})
.then(res=>res.json())
.then(updatedPost=>{

const postCard = btn.closest(".post-card");

postCard.querySelector(".post-title").innerText = updatedPost.title;
postCard.querySelector(".post-content").innerText = updatedPost.content;
postCard.querySelector(".post-topic").innerText = "# " + updatedPost.topic;

btn.innerText = "Edit";
btn.setAttribute("onclick",`editPost(${postId},this)`);

})
.catch(()=>alert("Failed to update post"));

}
function cancelEdit(postId,btn,title,content,topic){

const postCard = btn.closest(".post-card");

postCard.querySelector(".post-title").innerText = title;
postCard.querySelector(".post-content").innerText = content;
postCard.querySelector(".post-topic").innerText = "# " + topic;

/* restore edit button */

btn.parentElement.innerHTML = `
<button onclick="editPost(${postId},this)">✏️ Edit</button>
<button onclick="archivePost(${postId})">📦 Archive</button>
<button onclick="deletePost(${postId},this,event)">🗑 Delete</button>
`;

}
let editingPostId = null;

function openEditModal(postId){

editingPostId = postId;

const postCard = document.querySelector(`button[onclick="openEditModal(${postId})"]`).closest(".post-card");

document.getElementById("editTitle").value =
postCard.querySelector(".post-title").innerText;

document.getElementById("editContent").value =
postCard.querySelector(".post-content").innerText;

document.getElementById("editTopic").value =
postCard.querySelector(".post-topic").innerText.replace("#","");

document.getElementById("editModal").style.display="flex";

}

function closeEditModal(){

document.getElementById("editModal").style.display="none";

}

function saveEditPost(){

const title = document.getElementById("editTitle").value;
const content = document.getElementById("editContent").value;
const topic = document.getElementById("editTopic").value;

fetch(`${API_BASE}/posts/edit/${editingPostId}`,{
method:"PUT",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({title,content,topic})
})
.then(res=>res.json())
.then(updatedPost=>{

loadPosts(); // refresh feed

closeEditModal();

});

}
