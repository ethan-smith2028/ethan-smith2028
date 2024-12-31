document.addEventListener("DOMContentLoaded", function () {
    const goLiveButton = document.getElementById("goLive");

    goLiveButton.addEventListener("click", function () {
        // Collect user inputs
        const team1Name = document.getElementById("team1NameInput").value.trim();
        const team2Name = document.getElementById("team2NameInput").value.trim();
        const team1Logo = document.getElementById("team1LogoInput").value.trim();
        const team2Logo = document.getElementById("team2LogoInput").value.trim();
        const level = document.getElementById("levelInput").value.trim();
        const ageGroup = document.getElementById("ageGroupInput").value.trim();

        // Validate all required fields
        if (!team1Name || !team2Name || !team1Logo || !team2Logo || !level || !ageGroup) {
            alert("Please fill out all fields before proceeding.");
            return;
        }

        // Generate a unique game ID
        const gameId = `game-${Date.now()}`;

        // Initialize and store game data
        const gameData = {
            gameId: gameId,
            team1Name: team1Name,
            team2Name: team2Name,
            team1Logo: team1Logo,
            team2Logo: team2Logo,
            level: level,
            ageGroup: ageGroup,
            team1Score: 0,
            team2Score: 0,
            team1Shots: 0,
            team2Shots: 0,
            period: 1,
        };

        // Save game data to localStorage
        localStorage.setItem(gameId, JSON.stringify(gameData));

        // Redirect to live.html with the game ID as a query parameter
        window.location.href = `live.html?live=${gameId}`;
    });
});
