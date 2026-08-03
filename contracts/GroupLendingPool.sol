// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GroupLendingPool
 * @notice Solidarity-group lending with member consent (thesis §3, DT-II GroupLendingPool).
 */
contract GroupLendingPool is AccessControl, ReentrancyGuard {
  bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");

  enum GroupStatus { Forming, Active, Closed }

  struct Group {
    uint256 id;
    address organizer;
    address localBank;
    uint8 memberCount;
    uint8 consentCount;
    GroupStatus status;
  }

  struct Member {
    address wallet;
    bool consented;
    bool active;
  }

  uint8 public constant MIN_MEMBERS = 3;
  uint8 public constant MAX_MEMBERS = 20;

  uint256 public nextGroupId = 1;
  mapping(uint256 => Group) public groups;
  mapping(uint256 => mapping(address => Member)) public members;
  mapping(uint256 => address[]) public groupMembers;

  event GroupCreated(uint256 indexed groupId, address indexed organizer, address indexed localBank);
  event MemberAdded(uint256 indexed groupId, address indexed member);
  event ConsentRecorded(uint256 indexed groupId, address indexed member);
  event GroupActivated(uint256 indexed groupId);

  constructor(address admin) {
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _grantRole(ORGANIZER_ROLE, admin);
  }

  function createGroup(address localBank) external onlyRole(ORGANIZER_ROLE) returns (uint256 id) {
    id = nextGroupId++;
    groups[id] = Group({
      id: id,
      organizer: msg.sender,
      localBank: localBank,
      memberCount: 0,
      consentCount: 0,
      status: GroupStatus.Forming
    });
    emit GroupCreated(id, msg.sender, localBank);
  }

  function addMember(uint256 groupId, address member) external onlyRole(ORGANIZER_ROLE) {
    Group storage g = groups[groupId];
    require(g.status == GroupStatus.Forming, "not forming");
    require(g.memberCount < MAX_MEMBERS, "group full");
    require(!members[groupId][member].active, "exists");
    members[groupId][member] = Member({ wallet: member, consented: false, active: true });
    groupMembers[groupId].push(member);
    g.memberCount += 1;
    emit MemberAdded(groupId, member);
  }

  function recordConsent(uint256 groupId) external {
    Member storage m = members[groupId][msg.sender];
    require(m.active, "not member");
    require(!m.consented, "already consented");
    m.consented = true;
    groups[groupId].consentCount += 1;
    emit ConsentRecorded(groupId, msg.sender);
    if (
      groups[groupId].consentCount == groups[groupId].memberCount &&
      groups[groupId].memberCount >= MIN_MEMBERS
    ) {
      groups[groupId].status = GroupStatus.Active;
      emit GroupActivated(groupId);
    }
  }

  function isGroupReady(uint256 groupId) external view returns (bool) {
    Group memory g = groups[groupId];
    return g.status == GroupStatus.Active;
  }
}
