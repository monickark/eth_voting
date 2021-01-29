if(window.ethereum){
  console.log("inside etheerium");
web31 = new Web3(window.ethereum)
window.ethereum.enable()
} else if(window.web3) {
  console.log("inside web3");
web31 = new Wb3(window.web3.currentProvider);
} else {
  console.log("inside console.log");
}
web3.eth.getAccounts(function (error,accounts){
  console.log("curr acc"+ accounts[0]);    
  App.account =    accounts[0];   
})

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3 : async function (){
    if (typeof window.web3 === 'undefined'){
        console.log("if");
        App.web3Provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:8545");
    }
    else{
         console.log("else");
         App.web3Provider = web3.currentProvider;
    }
      App.web3Provider = web31.currentProvider;
      web3 = new Web3(App.web3Provider);
      web3 = web31;
      var address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
      return  await App.initContract();
  },

  initContract: function() {
    console.log("inside initContract.");
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);
     // App.listenForEvents();
      return App.render();
    });
  },

  // // Listen for events emitted from the contract
  // listenForEvents: async function() {    
  //   console.log("inside listenForEvents.");
  //   App.contracts.Election.deployed().then(async function(instance) {
  //     await instance.votedEvent({}, {
  //       fromBlock: 0, toBlock: 'latest'
  //     }).watch(function(error, event) {
  //       console.log("event triggered: VotedEvent")
  //       App.render();
  //     });
  //   });

  //   App.contracts.Election.deployed().then(async function(instance) {
  //     await instance.addEvent({}, {
  //       fromBlock: 0, toBlock: 'latest'
  //     }).watch(function(error, event) {
  //       console.log("event triggered: addEvent")
  //       App.render();
  //     });
  //   });

  //   App.contracts.Election.deployed().then(async function(instance) {
  //     await instance.deleteEvent({}, {
  //       fromBlock: 0, toBlock: 'latest'
  //     }).watch(function(error, event) {
  //        console.log("event triggered: deleteEvent")
  //        App.render();
  //     });
  //   });
    
  // },

  render: function() {    
    console.log("******inside render******")
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    var candidatesResults = $("#candidatesResults");
    candidatesResults.html();
    var candidatesSelect = $('#candidatesSelect');
    candidatesSelect.empty();
    var candidatesList = $('#candidatesList');
    candidatesList.empty();

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {     
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {   
      console.log("candidatesCount b4 table: " + candidatesCount);

      for (var i = 1; i <= candidatesCount; i++) {
        console.log("Inside loop: " + i);
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];
          console.log("id: " + id +" name: " + name +" voteCount: " + voteCount);
          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);
          
          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
          candidatesList.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        console.log("already voted.....");
       // $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castVote: function() {
    console.log("***** inside castVote ******");
    var candidateId = $('#candidatesSelect').val();
    console.log("candidateId : " + candidateId);
    console.log("account : " + App.account);
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      console.log("result : " + result);
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
      return App.render();
    }).catch(function(err) {
      console.error(err);
    });
  },

  addCanditate: function() {
    console.log("***** inside addCanditate ******");
    var candidateName = $('#candidateAdd').val();
    console.log("candidateName : " + candidateName);
    console.log("account : " + App.account);
    App.contracts.Election.deployed().then(function(instance) {
      return instance.addCandidate(candidateName, { from: App.account });
    }).then(function(result) {
      
      console.log("result : " + result);
      $("#content").hide();
      $("#loader").show();
      console.log("addCanditate b4 App.render");
      return App.render();
    }).catch(function(err) {
      console.error(err);
    });
  },

  deleteCanditate: function() {
    console.log("***** inside deleteCanditate ******");
    var candidateId = $('#candidatesSelect').val();
    console.log("candidateId : " + candidateId);
    console.log("account : " + App.account);
    App.contracts.Election.deployed().then(function(instance) {
      return instance.deleteCandidate(candidateId, { from: App.account });
    }).then(function(result) {
      console.log("result : " + result);
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
      return App.render();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
