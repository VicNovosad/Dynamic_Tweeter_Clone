const Tweeter = {
    activeUserIndex: 0,
    setUser(activeUserIndex) {
        // let data = fetch('https://gist.githubusercontent.com/VicNovosad/1cf0f7119d8fca2408014b0837fe33ed/raw/4dc231bceb7b05003bf4b58a4a5fe31cb26b9ae7/dynamic_tweeter_clone_data.json')
        // .then(res => res.json()).then(data => console.log(data));

        this.activeUserIndex = activeUserIndex;
        const self = this;
        $.ajax({
            // url: "data.json",
            type: "GET",
            url: "https://gist.githubusercontent.com/VicNovosad/1cf0f7119d8fca2408014b0837fe33ed/raw/4dc231bceb7b05003bf4b58a4a5fe31cb26b9ae7/dynamic_tweeter_clone_data.json",
            dataType: 'json',
            success: function(data){
                // Checking if this UserIndex exist in the database
                if (!isNaN(+self.activeUserIndex)){// if it's a number, convert to number
                    self.activeUserIndex = +self.activeUserIndex;
                    self.activeUserIndex = Object.keys(data)[+self.activeUserIndex]; // Call Object key by Index Number
                    if (self.activeUserIndex === undefined || self.activeUserIndex === 'home') {
                        if (self.activeUserIndex === 'home') console.log("Timeline page.");
                        else console.log("This User Index does not exist in the database, will be shown time line instead.");
                        self.activeUserIndex = Object.keys(data)[0];
                        self.setTimeLine(data);
                        // window.location.replace("/?user=0");
                    };
                } 
                //Checking if this User Name exist in the database
                if(self.activeUserIndex in data){
                    self.setHeader(data[self.activeUserIndex]);
                } else {
                    console.log('This User Name does not exist in the database, will be shown time line instead.');
                    self.activeUserIndex = Object.keys(data)[0];
                    self.setTimeLine(data);
                    // window.location.replace("/?user=0");
                }
                // console.log(`ActiveUser: ${self.activeUserIndex}`);
                self.setHeader(data[self.activeUserIndex]);

                if(self.activeUserIndex === "home"){
                    self.getTimelineTweets(data);
                    self.appendTimelineTweets(data);
                } else {
                    console.log(`Page of @${self.activeUserIndex} User`)
                    self.setNavigationPanel(data[self.activeUserIndex]);
                    self.setProfileDetails(data[self.activeUserIndex]);
                    self.setTweetNavigationListeners(data, self.activeUserIndex);
                    self.appendTweets('Tweets', data, self.activeUserIndex);
                }
            }
        });
        return this;
    },
    getTimelineTweets(data){
        for (const key in data) {
            if (key !== 'home'){
                for (const tweet of data[key].tweets) {
                    if (data.home.tweets){
                        if (!('retweetUserName' in tweet)){
                            tweet.tweetedUser = key;
                            data.home.tweets.push(tweet);
                        }
                    } else {
                        console.log('"tweets" key does not exist, creating');
                        data['home'].tweets = [tweet];
                    }
                }
            }
        }
        
        // data['home'].tweets.sort(descending);
        // function ascending( a, b ) {
        //     return new Date(a.timestamp).getTime() 
        //             - new Date(b.timestamp).getTime();
        // }
        // function descending( a, b ) {
        //     return new Date(b.timestamp).getTime() 
        //             - new Date(a.timestamp).getTime();
        // }
    },
    setTimeLine(Data){
        const self = this;
        $('.go-back-arrow').hide();
        $('header .name-wrap').addClass('w-full mx-4').html(`
            <div class="name-line flex justify-between items-center w-full">
                <h1 class="name font-bold text-xl">User Name</h1>
                <div class="wrap group">
                    <svg class="top-tweets w-9 h-9 p-1.5 ml-1 group hover:bg-gray-300 rounded-full duration-500" viewBox="0 0 24 24" aria-label="Verified account" role="img" fill="black">
                        <path d="M2 4c1.66 0 3-1.34 3-3h1c0 1.66 1.34 3 3 3v1C7.34 5 6 6.34 6 8H5c0-1.66-1.34-3-3-3V4zm7.89 4.9C11.26 7.53 12 5.35 12 2h2c0 3.35.74 5.53 2.1 6.9 1.36 1.36 3.55 2.1 6.9 2.1v2c-3.35 0-5.54.74-6.9 2.1-1.36 1.37-2.1 3.55-2.1 6.9h-2c0-3.35-.74-5.53-2.11-6.9C8.53 13.74 6.35 13 3 13v-2c3.35 0 5.53-.74 6.89-2.1zm7.32 3.1c-.97-.42-1.81-.97-2.53-1.69-.71-.71-1.27-1.56-1.68-2.52-.42.96-.98 1.81-1.69 2.52-.72.72-1.56 1.27-2.53 1.69.97.42 1.81.97 2.53 1.69.71.71 1.27 1.56 1.69 2.52.41-.96.97-1.81 1.68-2.52.72-.72 1.56-1.27 2.53-1.69z"></path>
                    </svg>
                    <button class="hover-message opacity-0 absolute right-[8px] bottom-[-12px] px-1 py-[1px] pb-0.5 bg-gray-500 text-white text-sm group-hover:opacity-100 duration-1000 ease-in delay-200">Top tweets</button>
                </div>
            </div>`);
        $('.profile-details').html(`
            <div class="wrap flex-col w-3/4 justify-start border-b mx-auto">
                    <input class="text-2xl placeholder:text-gray-600 focus:outline-none" type="text" name="tweet-input" placeholder="What's happening?">
                    <div class="wrap flex items-center mt-6">
                        <svg class="text-gray-400 group-hover:text-gray-500 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="var(--blue)">
                            <path d="M12 1.75C6.34 1.75 1.75 6.34 1.75 12S6.34 22.25 12 22.25 22.25 17.66 22.25 12 17.66 1.75 12 1.75zm-.25 10.48L10.5 17.5l-2-1.5v-3.5L7.5 9 5.03 7.59c1.42-2.24 3.89-3.75 6.72-3.84L11 6l-2 .5L8.5 9l5 1.5-1.75 1.73zM17 14v-3l-1.5-3 2.88-1.23c1.17 1.42 1.87 3.24 1.87 5.23 0 1.3-.3 2.52-.83 3.61L17 14z"></path>
                        </svg>
                        <h5 class="text-[color:var(--blue)] text-base font-bold ml-1">Everyone can replay</h5>
                    </div>
                </div>
                <div class="wrap flex w-4/5 justify-between border-b mx-auto">
                    <div class="reaction-bar flex justify-between">
                        <button class="reply-btn group hover:text-[var(--blue)] flex items-center w-1/4">
                            <svg class="w-9 h-9 py-2 text-gray-700 rounded-full group-hover:bg-[var(--light-blue)] group-hover:text-[var(--blue)]" viewBox="0 0 24 24" fill="var(--blue)">
                                <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path>
                            </svg>
                        </button>
                        <button class="reply-btn group hover:text-[var(--blue)] flex items-center w-1/4">
                            <svg class="w-9 h-9 py-2 text-gray-700 rounded-full group-hover:bg-[var(--light-blue)] group-hover:text-[var(--blue)]" viewBox="0 0 24 24" fill="var(--blue)">
                                <path d="M3 5.5C3 4.119 4.12 3 5.5 3h13C19.88 3 21 4.119 21 5.5v13c0 1.381-1.12 2.5-2.5 2.5h-13C4.12 21 3 19.881 3 18.5v-13zM5.5 5c-.28 0-.5.224-.5.5v13c0 .276.22.5.5.5h13c.28 0 .5-.224.5-.5v-13c0-.276-.22-.5-.5-.5h-13zM18 10.711V9.25h-3.74v5.5h1.44v-1.719h1.7V11.57h-1.7v-.859H18zM11.79 9.25h1.44v5.5h-1.44v-5.5zm-3.07 1.375c.34 0 .77.172 1.02.43l1.03-.86c-.51-.601-1.28-.945-2.05-.945C7.19 9.25 6 10.453 6 12s1.19 2.75 2.72 2.75c.85 0 1.54-.344 2.05-.945v-2.149H8.38v1.032H9.4v.515c-.17.086-.42.172-.68.172-.76 0-1.36-.602-1.36-1.375 0-.688.6-1.375 1.36-1.375z"></path>
                            </svg>
                        </button>
                        <button class="reply-btn group hover:text-[var(--blue)] flex items-center w-1/4">
                            <svg class="w-9 h-9 py-2 text-gray-700 rounded-full group-hover:bg-[var(--light-blue)] group-hover:text-[var(--blue)]" viewBox="0 0 24 24" fill="var(--blue)">
                                <path d="M6 5c-1.1 0-2 .895-2 2s.9 2 2 2 2-.895 2-2-.9-2-2-2zM2 7c0-2.209 1.79-4 4-4s4 1.791 4 4-1.79 4-4 4-4-1.791-4-4zm20 1H12V6h10v2zM6 15c-1.1 0-2 .895-2 2s.9 2 2 2 2-.895 2-2-.9-2-2-2zm-4 2c0-2.209 1.79-4 4-4s4 1.791 4 4-1.79 4-4 4-4-1.791-4-4zm20 1H12v-2h10v2zM7 7c0 .552-.45 1-1 1s-1-.448-1-1 .45-1 1-1 1 .448 1 1z"></path>
                            </svg>
                        </button>
                        <button class="reply-btn group hover:text-[var(--blue)] flex items-center w-1/4">
                            <svg class="w-9 h-9 py-2 text-gray-700 rounded-full group-hover:bg-[var(--light-blue)] group-hover:text-[var(--blue)]" viewBox="0 0 24 24" fill="var(--blue)">
                                <path d="M8 9.5C8 8.119 8.672 7 9.5 7S11 8.119 11 9.5 10.328 12 9.5 12 8 10.881 8 9.5zm6.5 2.5c.828 0 1.5-1.119 1.5-2.5S15.328 7 14.5 7 13 8.119 13 9.5s.672 2.5 1.5 2.5zM12 16c-2.224 0-3.021-2.227-3.051-2.316l-1.897.633c.05.15 1.271 3.684 4.949 3.684s4.898-3.533 4.949-3.684l-1.896-.638c-.033.095-.83 2.322-3.053 2.322zm10.25-4.001c0 5.652-4.598 10.25-10.25 10.25S1.75 17.652 1.75 12 6.348 1.75 12 1.75 22.25 6.348 22.25 12zm-2 0c0-4.549-3.701-8.25-8.25-8.25S3.75 7.451 3.75 12s3.701 8.25 8.25 8.25 8.25-3.701 8.25-8.25z"></path>
                            </svg>
                        </button>
                        <button class="reply-btn group hover:text-[var(--blue)] flex items-center w-1/4">
                            <svg class="w-9 h-9 py-2 text-gray-700 rounded-full group-hover:bg-[var(--light-blue)] group-hover:text-[var(--blue)]" viewBox="0 0 24 24" fill="var(--blue)">
                                <path d="M6 3V2h2v1h6V2h2v1h1.5C18.88 3 20 4.119 20 5.5v2h-2v-2c0-.276-.22-.5-.5-.5H16v1h-2V5H8v1H6V5H4.5c-.28 0-.5.224-.5.5v12c0 .276.22.5.5.5h3v2h-3C3.12 20 2 18.881 2 17.5v-12C2 4.119 3.12 3 4.5 3H6zm9.5 8c-2.49 0-4.5 2.015-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.01-4.5-4.5-4.5zM9 15.5C9 11.91 11.91 9 15.5 9s6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5S9 19.09 9 15.5zm5.5-2.5h2v2.086l1.71 1.707-1.42 1.414-2.29-2.293V13z"></path>
                            </svg>
                        </button>
                        <button class="reply-btn group hover:text-[var(--blue)] flex items-center w-1/4">
                            <svg class="w-9 h-9 py-2 text-gray-700 rounded-full group-hover:bg-[var(--light-blue)] group-hover:text-[var(--blue)]" viewBox="0 0 24 24" fill="var(--blue)">
                                <path d="M12 7c-1.93 0-3.5 1.57-3.5 3.5S10.07 14 12 14s3.5-1.57 3.5-3.5S13.93 7 12 7zm0 5c-.827 0-1.5-.673-1.5-1.5S11.173 9 12 9s1.5.673 1.5 1.5S12.827 12 12 12zm0-10c-4.687 0-8.5 3.813-8.5 8.5 0 5.967 7.621 11.116 7.945 11.332l.555.37.555-.37c.324-.216 7.945-5.365 7.945-11.332C20.5 5.813 16.687 2 12 2zm0 17.77c-1.665-1.241-6.5-5.196-6.5-9.27C5.5 6.916 8.416 4 12 4s6.5 2.916 6.5 6.5c0 4.073-4.835 8.028-6.5 9.27z"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="btn-wrap flex">
                        <button class="button tweet-btn m-4 ml-auto">Write</button>
                    </div>
            </div>
        `);
        $(`.tweets-container`).html(`
            <div class="tab-selector w-full border-b relative">
            <button id="sort-btn" class="absolute right-0 bottom-0 mr-8 p-1.5 px-6 opacity-75 bg-[color:var(--blue)] hover:opacity-100  rounded-t-lg text-lg text-white">Sort</button>
                <div data-id="Tweets" class="tab active py-4 w-1/4 hover:bg-gray-200 text-lg font-medium cursor-pointer duration-300 transition">
                        <h3>Timeline</h3>
                </div>
            </div>                
            </div>
            <div class="tweets-content w-full">
                <div id="Tweets" class="content-body active text-left">
                </div>
            </div>
        `);
        // Adding event listener to Sort button
        let isDescend = true;
        $(`#sort-btn`).click(function(e){
            self.sortTweets(Data, 'home', isDescend);
            isDescend = isDescend ? false : true;
            self.cleanTab('Tweets');
            self.appendTimelineTweets(Data);
        });
    },
    setHeader(User) {
        $(`header .name`).text(User.displayName);
        $(`header .tweets-number`)
        .text(`${this.formatNumber(User.tweets.length)} Tweets`);
        $(`.picture-container .background-picture`)
        .css('background-image', `url(${User.coverPhotoURL})`);
        $(`.picture-container .avatar-picture`)
        .css('background-image', `url(${User.avatarURL})`);
    },
    setNavigationPanel(User){
        $(`.left-nav-col .hover-message`).text(`${User.displayName} Settings`);
    },
    setProfileDetails(User){
        $(`.profile-details .name`).text(User.displayName);
        $(`.profile-details .email`).text(User.userName);
        $(`.profile-details .joined-date`).text(`Joined ${User.joinedDate}`);
        $(`.profile-details .following`)
        .text(this.formatNumber(User.followingCount));
        $(`.profile-details .followers`)
        .text(this.formatNumber(User.followerCount));
    },
    setTweetNavigationListeners(Data, UserId){
        const self = this;
        $('.tab-selector .tab').click(function(e){
            $('.content-body').removeClass('active');
            $('.tab-selector .tab').removeClass('active');
            $(this).addClass('active');
            self.setTab($(this).data('id'), Data, UserId);
        })
    },
    setTab(tabId, Data, UserId){
        $(`#${tabId}`).addClass('active');
        // this.cleanTab(tabId);
        this.appendTweets(tabId, Data, UserId);
    },
    cleanTab(tabId){
        $(`#${tabId}`).html('');
    },
    appendTimelineTweets(Data){
        const self = this;
        Data['home'].tweets.forEach(function(tweet) {
            let isRetweet = false;
            const $currentTweet = self.appendTweet(Data[tweet.tweetedUser], tweet, isRetweet)
                                    .appendTo($(`#${'Tweets'}`));
            self.addEventListenersForTweetButtons($currentTweet, tweet);
        });
    },
    sortTweets(Data, UserIndex, isDescend){
        isDescend ? Data[UserIndex].tweets.sort(descend) : Data['home'].tweets.sort(ascend);

        function ascend( a, b) {
            return new Date(a.timestamp).getTime()
                    - new Date(b.timestamp).getTime();
        }
        function descend( a, b) {
            return new Date(b.timestamp).getTime()
                    - new Date(a.timestamp).getTime();
        }
    },
    appendTweets(tabId, Data, UserId){
        const self = this;
        Data[UserId].tweets.forEach(function(tweet, index) {
            // console.log(tweet, index);
            // ${("retweetAvatarURL" in tweet) ? tweet.retweetAvatarURL : User.avatarURL}
            let isRetweet = false;
            let tweetedUser = UserId;
            if ("retweetUserName" in tweet){
                isRetweet = true;
                tweetedUser = tweet.retweetUserName;
                tweet = Data[tweetedUser].tweets[tweet.tweetIndex];
            }

            const $currentTweet = self.appendTweet(Data[tweetedUser], tweet, isRetweet)
                                    .appendTo($(`#${tabId}`));
            self.addEventListenersForTweetButtons($currentTweet, tweet);
        });
        $(`.retweet-name`).text(`${Data[UserId].displayName} Retweeted`);
    },
    addEventListenersForTweetButtons($currentTweet, tweet){
        const self = this;
        // Adding listeners for created tweet buttons
        $currentTweet.find(`button`).mousedown(function(e){
            const buttonDataId = $(this).data('id');
            if (buttonDataId === 'more' || buttonDataId === 'share'){
                $(this).children('.dropdown').toggle();
            } else {
                if(!tweet[buttonDataId]){
                    console.log('it is not exist, or equal to 0');
                    if (e.which === 1) tweet[buttonDataId] = 1;
                    if (e.which === 3) tweet[buttonDataId] = 0;
                } else {
                    if (e.which === 1) tweet[buttonDataId]++ ;
                    if (e.which === 3) tweet[buttonDataId]-- ;
                }
                $(this).children('h5').text(`${self.formatNumber(tweet[buttonDataId])}`);
            }
        });
        $currentTweet.find(`button.dropdown-btn`).blur(function(){
            $(this).children('.dropdown').hide();
        });
    },
    appendTweet(user, tweet, isRetweet){
        const self = this;
        $Tweet = $(`<div class="tweet-box border-t p-4">
                ${(isRetweet) ? `<div class="retweet-indicator active flex ml-8">
                    <svg class="retweet-icon w-4 h-4 ml-1" viewBox="0 0 24 24">
                        <path d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V20H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 2.71H11V4h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75z"></path></svg>
                    <h1 class="retweet-name font-bold text-sm pl-2 text-gray-600">User Retweeted</h1>
                </div>`
                : ''}
                <div class="tweet flex">
                    <!-- Avatar logo -->
                    <div class="avatar-wrap flex items-start w-[50px] mr-4 pt-2">
                        <div class="avatar-picture w-[50px] h-[50px] rounded-full bg-cover"
                             style="background-image: url(
                                ${user.avatarURL}
                                )">
                        </div>
                    </div>
                    <!-- Tweet's Author Info -->
                    <div class="tweet-wrap flex flex-col flex-grow">
                        <div class="tweet-header flex justify-between">
                            <div class="name-line flex items-center">
                                <a href="/?user=${user.userName.slice(1)}" target="_top"
                                    class="font-bold text-lg">
                                ${user.displayName}
                                </a>
                                <svg class="verified-account w-6 h-6 ml-1" viewBox="0 0 24 24" fill="var(--blue)"><g><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"></path></g></svg>
                                <h5 class="email pl-1">
                                ${user.userName}
                                </h5>
                                <span class="px-1 font-bold">·</span>
                                <h5 class="email">
                                ${self.formatTime(tweet.timestamp)}
                                </h5>
                            </div>
                            <button data-id="more" class="more-btn dropdown-btn relative" href="#">
                                <svg class="w-9 h-9 p-2 text-gray-700 rounded-full hover:bg-[var(--light-blue)]" viewBox="0 0 24 24" fill="rgb(60, 60, 60)"><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg>
                                <div class="dropdown hidden absolute top-[30px] right-0 z-10 mt-2 w-[310px] origin-top-right rounded-2xl bg-white shadow-lg transition duration-300 ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
                                    <div class="py-1" role="none">
                                        <a href="#" class="flex group text-black hover:bg-gray-200 px-4 py-2 text-base font-medium" role="menuitem" tabindex="-1" id="menu-item-0">
                                            <svg class="mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path>
                                            </svg>
                                            Unfollow ${user.userName}</a>
                                        <a href="#" class="flex group text-black hover:bg-gray-200 px-4 py-2 text-base font-medium" role="menuitem" tabindex="-1" id="menu-item-1">
                                            <svg class="mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M5.5 4c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5H12v2H5.5C4.12 22 3 20.88 3 19.5v-15C3 3.12 4.12 2 5.5 2h13C19.88 2 21 3.12 21 4.5V13h-2V4.5c0-.28-.22-.5-.5-.5h-13zM16 10H8V8h8v2zm-8 2h8v2H8v-2zm10 7v-3h2v3h3v2h-3v3h-2v-3h-3v-2h3z"></path>
                                            </svg>
                                            Add/remove ${user.userName}</a>
                                        <a href="#" class="flex group text-black hover:bg-gray-200 px-4 py-2 text-base font-medium" role="menuitem" tabindex="-1" id="menu-item-2">
                                            <svg class="mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M18 6.59V1.2L8.71 7H5.5C4.12 7 3 8.12 3 9.5v5C3 15.88 4.12 17 5.5 17h2.09l-2.3 2.29 1.42 1.42 15.5-15.5-1.42-1.42L18 6.59zm-8 8V8.55l6-3.75v3.79l-6 6zM5 9.5c0-.28.22-.5.5-.5H8v6H5.5c-.28 0-.5-.22-.5-.5v-5zm6.5 9.24l1.45-1.45L16 19.2V14l2 .02v8.78l-6.5-4.06z"></path>
                                            </svg>
                                            Mute ${user.userName}</a>
                                        <a href="#" class="flex group text-black hover:bg-gray-200 px-4 py-2 text-base font-medium" role="menuitem" tabindex="-1" id="menu-item-2">
                                            <svg class="mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M12 3.75c-4.55 0-8.25 3.69-8.25 8.25 0 1.92.66 3.68 1.75 5.08L17.09 5.5C15.68 4.4 13.92 3.75 12 3.75zm6.5 3.17L6.92 18.5c1.4 1.1 3.16 1.75 5.08 1.75 4.56 0 8.25-3.69 8.25-8.25 0-1.92-.65-3.68-1.75-5.08zM1.75 12C1.75 6.34 6.34 1.75 12 1.75S22.25 6.34 22.25 12 17.66 22.25 12 22.25 1.75 17.66 1.75 12z"></path>
                                            </svg>
                                            Block ${user.userName}</a>
                                        <a href="#" class="flex group text-black hover:bg-gray-200 px-4 py-2 text-base font-medium" role="menuitem" tabindex="-1" id="menu-item-2">
                                            <svg class="mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M15.24 4.31l-4.55 15.93-1.93-.55 4.55-15.93 1.93.55zm-8.33 3.6L3.33 12l3.58 4.09-1.5 1.32L.67 12l4.74-5.41 1.5 1.32zm11.68-1.32L23.33 12l-4.74 5.41-1.5-1.32L20.67 12l-3.58-4.09 1.5-1.32z"></path>
                                            </svg>
                                            Embed Tweet</a>
                                        <a href="#" class="flex group text-black hover:bg-gray-200 px-4 py-2 text-base font-medium" role="menuitem" tabindex="-1" id="menu-item-2">
                                            <svg class="mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z"></path>
                                            </svg>
                                            Report Tweet</a>
                                    </div>
                                </div>
                            </button>
                        </div>
                        <div class="tweet-message">
                            <p class="font-serif text-lg text-gray-900 pt-2">
                            ${tweet.text}
                            </p>
                        </div>
                        <!-- Reaction Bar -->
                        <div class="reaction-bar flex justify-between" oncontextmenu="return false;">
                            <button data-id="reply" class="reply-btn group hover:text-[var(--blue)] flex items-center w-1/4">
                                <svg class="w-9 h-9 py-2 text-gray-700 rounded-full group-hover:bg-[var(--light-blue)] group-hover:text-[var(--blue)]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></svg>
                                <h5 class="group-hover:text-[var(--blue)] pl-1">
                                ${self.formatNumber(tweet.reply)}
                                </h5>
                            </button>
                            <button data-id="retweet" class="retweet-btn group hover:text-[var(--green)] flex items-center w-1/4">
                                <svg class="w-9 h-9 p-2 text-gray-700 rounded-full group-hover:bg-[var(--light-green)] group-hover:text-[var(--green)]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V20H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 2.71H11V4h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 15.62V8.25c0-.97-.784-1.75-1.75-1.75z"></path></svg>
                                <h5 class="group-hover:text-[var(--green)] pl-1">
                                ${self.formatNumber(tweet.retweet)}
                                </h5>
                            </button>
                            <button data-id="like" class="like-btn group hover:text-[var(--red)] flex items-center w-1/4">
                                <svg class="w-9 h-9 p-2 text-gray-700 rounded-full group-hover:bg-[var(--pink)] group-hover:text-[var(--red)]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></svg>
                                <h5 class="group-hover:text-[var(--red)] pl-1">
                                ${self.formatNumber(tweet.like)}
                                </h5>
                            </button>
                            <button data-id="share" class="share-btn dropdown-btn relative group hover:text-[var(--blue)] flex items-center w-1/4">
                                <svg class="w-9 h-9 p-2 text-gray-700 rounded-full group-hover:bg-[var(--light-blue)] group-hover:text-[var(--blue)]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
                                </svg>
                                <div class="dropdown hidden absolute left-[-220px] top-[30px] right-0 z-10 mt-2 w-60 origin-top-right rounded-2xl bg-white shadow-lg transition duration-300 ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
                                    <div class="py-1" role="none">
                                        <a href="#" class="flex group text-black hover:bg-gray-200 px-4 py-2 text-base font-medium" role="menuitem" tabindex="-1" id="menu-item-0">
                                            <svg class="mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path>
                                            </svg>
                                            Copy link to Tweet</a>
                                        <a href="#" class="flex group text-black hover:bg-gray-200 px-4 py-2 text-base font-medium" role="menuitem" tabindex="-1" id="menu-item-1">
                                            <svg class="mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
                                            </svg>
                                            Share Tweet via ...</a>
                                        <a href="#" class="flex group text-black hover:bg-gray-200 px-4 py-2 text-base font-medium" role="menuitem" tabindex="-1" id="menu-item-2">
                                            <svg class="mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z"></path>
                                            </svg>
                                            Send va Direct Message</a>
                                        <a href="#" class="flex group text-black hover:bg-gray-200 px-4 py-2 text-base font-medium" role="menuitem" tabindex="-1" id="menu-item-2">
                                            <svg class="mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M17 3V0h2v3h3v2h-3v3h-2V5h-3V3h3zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V11h2v11.94l-8-5.71-8 5.71V4.5C4 3.12 5.119 2 6.5 2h4.502v2H6.5z"></path>
                                            </svg>
                                            Bookmark</a>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`)
            return $Tweet;
    },
    formatNumber(n) {
        if (n >= 1e9) return +(n / 1e9).toFixed(1) + "G";
        if (n >= 1e6) return +(n / 1e6).toFixed(1) + "M";
        if (n >= 1e3) return +(n / 1e3).toFixed(1) + "K";
        return n;
    },
    formatTime(time) {
        var distance = Date.now() - new Date(time).getTime();
        // Time calculations for hours & minutes
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        // let time;
        if (days > 0) {
            let isCurrentYear = (new Date(time).getFullYear() === new Date().getFullYear());
            isCurrentYear ? isCurrentYear = -1 : isCurrentYear = undefined;
            time = new Date(time).toDateString().split(' ').slice(1, isCurrentYear).join(', ').replace(',','');
        } else if (hours > 0) {
            time = `${hours}h`
        } else if (minutes > 0) {
            time = `${minutes}m`
        } else time = '1 m';
        
        return time;
    }
}

const Url = {
    url: new URLSearchParams(window.location.search), //create url search parameters
    keys: {},
    load(){
        let CurrentUser = 0; //Default CurrentUser if Url is empty
        const loadUrlQueries = [...this.url.entries()]; // clone URLEntries
        // console.log(`${this.url}`);
        // history.replaceState(null, null, "?"); //clean previous history
        for (const [key, value] of loadUrlQueries) {
            this.keys[`${key}`] = value; // add key to keys object
            if (key === 'user') {
                CurrentUser = value;
            }
        }
        // console.log(this.keys);
        return CurrentUser;
    }
};

Tweeter.setUser(Url.load());
