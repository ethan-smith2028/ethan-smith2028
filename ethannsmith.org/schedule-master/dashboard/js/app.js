// ======================================================
// DASHBOARD APP
// FIRESTORE VERSION
// ======================================================


// ======================================================
// FIREBASE IMPORTS
// ======================================================

import { db } from "../firebaseConfig.js";

import {

    collection,
    query,
    orderBy,
    onSnapshot

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";



// ======================================================
// ELEMENTS
// ======================================================

const clock =
    document.getElementById("clock");


const greeting =
    document.getElementById("greeting");


const greetingDate =
    document.getElementById("greetingDate");


const todayDate =
    document.getElementById("todayDate");


const dayName =
    document.getElementById("dayName");


const scheduleList =
    document.getElementById("scheduleList");


const notes =
    document.getElementById("notes");


const saveNotes =
    document.getElementById("saveNotes");



// ======================================================
// LIVE CLOCK
// ======================================================

function updateClock(){

    const now = new Date();



    // Current Time

    clock.textContent =
        now.toLocaleTimeString([], {

            hour:"numeric",

            minute:"2-digit",

            second:"2-digit"

        });



    // Day Name

    dayName.textContent =
        now.toLocaleDateString([], {

            weekday:"long"

        });



    // Full Date

    todayDate.textContent =
        now.toLocaleDateString([], {

            month:"long",

            day:"numeric",

            year:"numeric"

        });



    // Greeting Card Date

    greetingDate.textContent =
        now.toLocaleDateString([], {

            weekday:"long",

            month:"long",

            day:"numeric"

        });

}

updateClock();


setInterval(

    updateClock,

    1000

);



// ======================================================
// GREETING
// ======================================================

function updateGreeting(){


    const hour =
        new Date()
        .getHours();



    if(hour < 12){


        greeting.textContent =
            "Good Morning ☀️";


    }

    else if(hour < 17){


        greeting.textContent =
            "Good Afternoon 🌤";


    }

    else{


        greeting.textContent =
            "Good Evening 🌙";


    }


}



updateGreeting();



// ======================================================
// NOTES
// ======================================================


if(notes){


    notes.value =
        localStorage.getItem("dashboardNotes")
        || "";

}



if(saveNotes){


    saveNotes.addEventListener(

        "click",

        ()=>{


            localStorage.setItem(

                "dashboardNotes",

                notes.value

            );



            saveNotes.innerHTML =

                '<i class="fa-solid fa-check"></i> Saved!';



            setTimeout(()=>{


                saveNotes.innerHTML =
                    "Save Notes";


            },1500);



        }

    );


}



// ======================================================
// FIRESTORE SCHEDULE
// ======================================================


let scheduleEvents = [];



const scheduleQuery =
    query(
        collection(
            db,
            "schedule"
        )
    );


        orderBy(

            "date"

        ),


        orderBy(

            "time"

        )





onSnapshot(

    scheduleQuery,

    (snapshot)=>{


        console.log(
            "Dashboard schedule loaded:",
            snapshot.docs.map(
                doc => doc.data()
            )
        );



        scheduleEvents = [];



        snapshot.forEach(

            (document)=>{


                scheduleEvents.push({

                    id: document.id,

                    ...document.data()

                });


            }

        );



        renderTodaySchedule();


    },


    (error)=>{


        console.error(
            "Dashboard Firestore Error:",
            error
        );


    }

);



// ======================================================
// GET LOCAL DATE
// ======================================================

function getToday(){


    const now =
        new Date();



    const year =
        now.getFullYear();



    const month =
        String(
            now.getMonth()+1
        )
        .padStart(2,"0");



    const day =
        String(
            now.getDate()
        )
        .padStart(2,"0");



    return `${year}-${month}-${day}`;


}



// ======================================================
// TODAY'S SCHEDULE
// ======================================================

function renderTodaySchedule(){



    if(!scheduleList){

        return;

    }



    scheduleList.innerHTML = "";



    const today =
        getToday();




    const todaysEvents =

        scheduleEvents.filter(

            event =>

            event.date === today


        );





    if(todaysEvents.length === 0){


        scheduleList.innerHTML = `

            <div class="loading">

                No events today.

            </div>

        `;


        return;


    }





    todaysEvents.forEach(

        event=>{


            scheduleList.innerHTML += `


            <div class="scheduleItem">


                <div class="scheduleLeft">


                    <div class="scheduleTime">

                        ${formatTime(event.time)}

                    </div>



                    <div class="scheduleDetails">


                        <h3>

                            ${event.title}

                        </h3>



                        <p>

                            ${
                                event.location ||
                                event.notes ||
                                "No details"

                            }

                        </p>


                    </div>


                </div>




                <div class="statusDot"></div>



            </div>


            `;


        }


    );


}

// ======================================================
// FORMAT TIME
// ======================================================

function formatTime(time){


    if(!time){

        return "";

    }



    const parts =
        time.split(":");



    const date =
        new Date();



    date.setHours(

        Number(parts[0])

    );


    date.setMinutes(

        Number(parts[1])

    );



    return date.toLocaleTimeString([], {


        hour:"numeric",

        minute:"2-digit"


    });


}