// ======================================================
// SCHEDULE MANAGER
// FIRESTORE VERSION
// PART 2A
// ======================================================


// ======================================================
// FIREBASE IMPORTS
// ======================================================

import { db } from "../firebaseConfig.js";

import {

    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    deleteDoc,
    updateDoc,
    doc

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// ======================================================
// ELEMENTS
// ======================================================

const form = document.getElementById("eventForm");

const eventList = document.getElementById("eventList");


// Form Inputs

const titleInput =
    document.getElementById("title");

const dateInput =
    document.getElementById("date");

const timeInput =
    document.getElementById("time");

const locationInput =
    document.getElementById("location");

const notesInput =
    document.getElementById("notes");


// ======================================================
// VARIABLES
// ======================================================

let events = [];

let editingID = null;


// ======================================================
// FIRESTORE COLLECTION
// ======================================================

const scheduleCollection =
    collection(db, "schedule");


// ======================================================
// LOAD EVENTS IN REAL TIME
// ======================================================

const scheduleQuery = query(

    scheduleCollection,

    orderBy("date"),

    orderBy("time")

);


onSnapshot(scheduleQuery, (snapshot)=>{


    events = [];


    snapshot.forEach((document)=>{


        events.push({

            id: document.id,

            ...document.data()

        });


    });


    renderEvents();


});


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(dateString){


    if(!dateString){

        return "";

    }


    const date =
        new Date(dateString);



    return date.toLocaleDateString([], {


        weekday:"short",

        month:"short",

        day:"numeric",

        year:"numeric"


    });


}



// ======================================================
// FORMAT TIME
// ======================================================

function formatTime(timeString){


    if(!timeString){

        return "";

    }


    const [hour, minute] =
        timeString.split(":");



    const date =
        new Date();



    date.setHours(hour);

    date.setMinutes(minute);



    return date.toLocaleTimeString([], {


        hour:"numeric",

        minute:"2-digit"


    });


}



// ======================================================
// RENDER EVENTS
// ======================================================

function renderEvents(){


    eventList.innerHTML = "";



    if(events.length === 0){


        eventList.innerHTML = `

            <div class="event">

                <div>

                    <div class="eventTitle">

                        No Events

                    </div>


                    <div class="eventInfo">

                        Add your first event above.

                    </div>


                </div>

            </div>

        `;


        return;


    }




    events.forEach((event)=>{


        eventList.innerHTML += `


        <div class="event">


            <div>


                <div class="eventTitle">

                    ${event.title}

                </div>



                <div class="eventInfo">


                    📅 ${formatDate(event.date)}


                    <br>


                    🕒 ${formatTime(event.time)}


                    <br>


                    📍 ${event.location || "No location"}


                    <br>


                    📝 ${event.notes || "No notes"}


                </div>


            </div>




            <div class="actions">


                <button

                    class="editBtn"

                    onclick="editEvent('${event.id}')">


                    <i class="fa-solid fa-pen"></i>


                </button>




                <button

                    class="deleteBtn"

                    onclick="deleteEvent('${event.id}')">


                    <i class="fa-solid fa-trash"></i>


                </button>


            </div>



        </div>


        `;


    });


}

// ======================================================
// PART 2B
// CRUD FUNCTIONS
// ======================================================


// ======================================================
// ADD / UPDATE EVENT
// ======================================================

form.addEventListener("submit", async (event)=>{


    event.preventDefault();



    const newEvent = {


        title:
            titleInput.value.trim(),


        date:
            dateInput.value,


        time:
            timeInput.value,


        location:
            locationInput.value.trim(),


        notes:
            notesInput.value.trim()



    };



    try{


        // -----------------------------
        // UPDATE EXISTING EVENT
        // -----------------------------

        if(editingID){


            await updateDoc(


                doc(
                    db,
                    "schedule",
                    editingID
                ),


                newEvent


            );



            editingID = null;



        }


        // -----------------------------
        // CREATE NEW EVENT
        // -----------------------------

        else{


            await addDoc(


                collection(
                    db,
                    "schedule"
                ),


                newEvent


            );


        }




        resetForm();



    }


    catch(error){


        console.error(
            "Error saving event:",
            error
        );


        alert(
            "Could not save event."
        );


    }



});




// ======================================================
// DELETE EVENT
// ======================================================

window.deleteEvent = async function(id){



    const confirmDelete =
        confirm(
            "Delete this event?"
        );



    if(!confirmDelete){

        return;

    }




    try{


        await deleteDoc(


            doc(

                db,

                "schedule",

                id

            )


        );



    }


    catch(error){


        console.error(
            "Delete error:",
            error
        );


        alert(
            "Could not delete event."
        );


    }



};




// ======================================================
// EDIT EVENT
// ======================================================

window.editEvent = function(id){



    const selectedEvent =
        events.find(
            event =>
                event.id === id
        );



    if(!selectedEvent){

        return;

    }




    editingID = id;



    titleInput.value =
        selectedEvent.title;



    dateInput.value =
        selectedEvent.date;



    timeInput.value =
        selectedEvent.time;



    locationInput.value =
        selectedEvent.location || "";



    notesInput.value =
        selectedEvent.notes || "";





    window.scrollTo({

        top:0,

        behavior:"smooth"

    });



};




// ======================================================
// RESET FORM
// ======================================================

function resetForm(){



    form.reset();



    editingID = null;



}



// ======================================================
// AUTO SET TODAY DATE
// ======================================================

function setDefaultDate(){

    const now = new Date();


    const year =
        now.getFullYear();


    const month =
        String(now.getMonth()+1)
        .padStart(2,"0");


    const day =
        String(now.getDate())
        .padStart(2,"0");


    dateInput.value =
        `${year}-${month}-${day}`;

}



setDefaultDate();