function displayRadioValue(data) {
    alert("in")
    // document.getElementById("result").innerHTML = ""; 
    var ele = document.getElementsByTagName('gender'); 
      
    for(i = 0; i < ele.length; i++) { 
          
        if(ele[i].type="radio") { 
          
            if(ele[i] === data) 
                document.getElementById("result").innerHTML 
                        += ele[i].name + " Value: " 
                        + ele[i].value + "<br>"; 
        } 
    } 
}


function displayInterests(data) {

    var interests = document.getElementById("interests"); 
    var tag = document.createElement("li");
    
    for(i = 0; i < data.length; i++) { 
        var text = document.createTextNode(data[i]);
        tag.appendChild(text);
    }
    interests.appendChild(tag);
}
