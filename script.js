
const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const suggestions=document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton = document.querySelector("#toggle-Theme-Button");
const deleteChatButton = document.querySelector("#delete-Chat-Button");




let userMessage = null;

// API confliguratio n
const API_KEY ="AIzaSyCL6b0bMOWVO_i1TQJxgdxTQ6UdzHcLRzw";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;


const loadLocalstorageData = () => {
    const savedChats = localStorage.getItem("savedChats");
    const isLightMode =(localStorage.getItem("themeColor")) === "light_mode";

    //Apply the stored theme
    document.body.classList.toggle("light_mode", isLightMode);
    toggleThemeButton.innerText= isLightMode ? "dark_mode" : "light_mode";

    // Restore saved chats
    chatList.innerHTML = savedChats || ""; 

    
    document.body.classList.toggle("hide-header",savedChats); 
    chatList.scrollTo(0,chatList.scrollHeight); //scroll to the bottom
}

loadLocalstorageData();

// Create a new message element and return it
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content; // Corrected from innerHtml to innerHTML
    return div;
};


//Show typing effect by displaying words one by one 
const showTypingEffect = (text, textElement,incomingMessageDiv) =>{
    const words = text.split(' ');
    let currenWordIndex = 0;

    const typingInterval = setInterval(() => {
        // Append each word to the text element with a space
        textElement.innerText += (currenWordIndex === 0 ? '' : ' ') + words[currenWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");

        // if all words are displayed
        if(currenWordIndex === words.length){
            clearInterval(typingInterval);
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("savedChats",chatList.innerHTML); //show thats to local storage
        }
        chatList.scrollTo(0,chatList.scrollHeight); //scroll to the bottom
    },75);
}

//fetch response from the API based on user message
const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text"); //Get text element 

    //send a POST resquest to the API with the user's message
    try{
        const response = await fetch(API_URL,{
            method: "POST",
            headers:{"Content-Type": "application/json"},
            body:JSON.stringify({
                contents:[{
                    role:"user",
                    parts:[{text:userMessage}] 
                }]
            })
        });
        const data = await response.json();

        // console.log(data)
        //Get the API response text and remove asterisks from it 
        const apiResponse = data?.candidates[0].content.parts[0].text.replace('**');
        showTypingEffect(apiResponse,textElement,incomingMessageDiv);
    } catch(error){
        console.log(error);
    } finally{
        incomingMessageDiv.classList.remove("loading");
    }  
} 

//Show a loading animation while waiting for the API response
const showLoadingAnimation = () =>{  
    const html = `<div class="message-content">
                <img src="Gemini.png" alt="user Image" class="avater" >
                <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                </div>
            </div>
            <span onclick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

    const incomingMessageDiv = createMessageElement(html,"incoming","loading")
    chatList.appendChild(incomingMessageDiv);
    typingForm.querySelector(".typing-input").value = '';

    chatList.scrollTo(0,chatList.scrollHeight); //scroll to the bottom
    generateAPIResponse(incomingMessageDiv)
}

const copyMessage = (copyIcon)  =>{
    const messageText=copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyIcon.innerText="done";   //Show tick icon
    setTimeout(() => copyIcon.innerText="content_copy",1000);   //Revert icon after 1 secont 
}





// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if (!userMessage) 
        return; // Exit if there is no message

    const html = `<div class="message-content">
        <img src="user.jpg" alt="user Image" class="avatar" style=" width:40px;height:40px;object-fit:cover;border-radius: 50%;align-self: flex-start;"> 
        <!-- Corrected class name -->
        <p class="text" id="text">${userMessage}</p> <!-- Set userMessage here -->
    </div>`;

    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    chatList.appendChild(outgoingMessageDiv);
 
    
    // Clear the input field after sending the message
    typingForm.querySelector(".typing-input").value = '';
    chatList.scrollTo(0,chatList.scrollHeight);     //scroll to the bottom
    document.body.classList.add("hide-header");     // Hide the header once chat start
    // setTimeout(showLoadingAnimation,500);
};

//Set userMessage and handle outgoing chat when a suggestion is clicked
suggestions.forEach(suggestion =>{
    suggestion.addEventListener("click", () =>{
        userMessage = suggestion.querySelector(".text").innerText;
        handleOutgoingChat();
        showLoadingAnimation();
        document.body.classList.add("hide-header");     // Hide the header once chat start

    });
});


// toggle between light and dark themes
toggleThemeButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor",isLightMode ? "light_mode" : "dark_mode");
    toggleThemeButton.innerText= isLightMode ? "dark_mode" : "light_mode";
})

//Delete all chats from local storage when button is clicked
deleteChatButton.addEventListener("click",() =>{
    if(confirm("Are you want to delete all message?")){
        localStorage.removeItem("savedChats");
        loadLocalstorageData();
    }
})

// Prevent default form submission and handle outgoing chat
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
    showLoadingAnimation();
});



