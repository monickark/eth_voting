pragma solidity 0.4.25;

contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store Candidates
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;
    // Store Candidates Count
    uint public candidatesCount;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );
    // add event
    event addEvent (
        string indexed _name
    );
     // delete event
    event deleteEvent (
        uint indexed _candidateId
    );

    constructor () public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate (string _name) public returns (string) {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
         // trigger voted event
        emit addEvent(_name);
        return "success";
    }

    function deleteCandidate (uint _candidateId) public returns (string) {
          delete candidates[_candidateId-1];
          candidatesCount--;          
         // trigger voted event
        emit deleteEvent(_candidateId);
        return "success";
    }

    function vote (uint _candidateId) public returns (string) {
        // require that they haven't voted before
       // require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        emit votedEvent(_candidateId);
        return "success";
    }
}
