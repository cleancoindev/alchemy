import { Address, IProposalState, IRewardState } from "@daostack/client";
import BN = require("bn.js");
import { getArc } from "../arc";

const tokens = require("data/tokens.json");
const exchangesList = require("data/exchangesList.json");

export default class Util {
  public static fromWei(amount: BN): number {
    try {
      return Number(getArc().web3.utils.fromWei(amount.toString(), "ether"));
    } catch (err) {
      console.warn(`Invalid number value passed to fromWei: "${amount}"`);
      return 0;
    }
  }

  public static toWei(amount: number): BN {
    return new BN(getArc().web3.utils.toWei(amount.toString(), "ether"));
  }

  public static getBalance(account: Address) {
    return getArc().web3.eth.getBalance(account);
  }

  public static copyToClipboard(value: any) {
    const el = document.createElement("textarea");
    el.value = value;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }

  public static async getLatestBlock() {
    try {
      return (await getArc().web3.getBlock("latest")).number;
    } catch (err) {
      throw err;
    }
  }

  public static trace<T>(x: T, ...args: any[]): T {
    // tslint:disable-next-line:no-console
    console.debug("trace", ...args, x);
    return x;
  }

  public static getWeb3() {
    return getArc().web3;
  }
  public static async getNetworkId() {
    return await getArc().web3.eth.net.getId();
  }

  public static defaultAccount() {
    return getArc().web3.eth.defaultAccount;
  }
}

export function humanProposalTitle(proposal: IProposalState) {
  return proposal.title ||
    "[No title " + proposal.id.substr(0, 6) + "..." + proposal.id.substr(proposal.id.length - 4) + "]";
}

export function supportedTokens() {
  tokens[getArc().GENToken().address] = {
    decimals: 18,
    name: "DAOstack GEN",
    symbol: "GEN"
  };

  return tokens;
}

export function getExchangesList() {
  return exchangesList;
}

export function formatTokens(amountWei: BN, symbol?: string, decimals = 18): string {
  const negative = amountWei.lt(new BN(0));
  const amount = Math.abs(decimals === 18 ? Util.fromWei(amountWei) : amountWei.div(new BN(10).pow(new BN(decimals))).toNumber());

  let returnString;
  if (amount === 0) {
    returnString = "0";
  } else if (amount < 0.01) {
    returnString = "+0";
  } else if (amount < 1000) {
    returnString = amount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2});
  } else if (amount < 1000000) {
    returnString = (amount / 1000)
      .toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2}) + "k";
  } else {
    returnString = (amount / 1000000)
      .toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2}) + "M";
  }
  return (negative ? "-" : "") + returnString + (symbol ? " " + symbol : "");
}

export function tokenSymbol(tokenAddress: string) {
  const token = supportedTokens()[tokenAddress.toLowerCase()];
  return token ? token["symbol"] : "?";
}

export async function waitUntilTrue(test: () => Promise<boolean> | boolean, timeOut: number = 1000) {
  return new Promise((resolve, reject) => {
    const timerId = setInterval(async () => {
      if (await test()) { return resolve(); }
    }, 30);
    setTimeout(() => { clearTimeout(timerId); return reject(new Error("Test timed out..")); }, timeOut);
  });
}

/**
 * return true if the address is the address of a known scheme (which we know how to represent)
 * @param  address [description]
 * @return         [description]
 */
export function isKnownScheme(address: Address) {
  const arc = getArc();
  const contractInfo = arc.getContractInfo(address);
  if (["ContributionReward", "SchemeRegistrar", "GenericScheme"].includes(contractInfo.name)) {
    return true;
  } else {
    return false;
  }
}

export function schemeName(address: string) {
  const arc = getArc();
  try {
    const contractInfo = arc.getContractInfo(address);

    const NAMES: {[key: string]: string; }  = {
      ContributionReward: "Contribution Reward",
      SchemeRegistrar : "Scheme Registrar",
      GenericScheme : "Generic Scheme"
    };

    if (NAMES[contractInfo.name]) {
      return `${address.slice(0, 4)}...${address.slice(-4)} (${NAMES[contractInfo.name]})`;
    }  else if (contractInfo.name) {
      return `${address.slice(0, 4)}...${address.slice(-4)} (${contractInfo.name})`;
    } else {
      return `${address.slice(0, 4)}...${address.slice(-4)}`;

    }
  } catch (err) {
    if (err.message.match(/No contract/)) {
      return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }
  }
}

export async function getNetworkName(id?: string): Promise<string> {
  if (!id) {
    id = (await Util.getNetworkId()).toString();
  }

  switch (id) {
    case "main":
    case "1":
      return "main";
    case "morden":
    case "2":
      return "morden";
    case "ropsten":
    case "3":
      return "ropsten";
    case "rinkeby":
    case "4":
      return "rinkeby";
    case "kovan":
    case "42":
      return "kovan";
    case "private":
    case "1512051714758":
      return "ganache";
    default:
      return `unknown (${id})`;
  }
}

export function linkToEtherScan(address: Address) {
  let prefix = "";
  const arc = getArc();
  if (arc.web3.currentProvider.networkVersion === "4") {
    prefix = "rinkeby.";
  }
  return `https://${prefix}etherscan.io/address/${address}`;
}

export function getClaimableRewards(reward: IRewardState) {
  if (!reward) return {};

  const result: {[key: string]: BN} = {};
  if (reward.reputationForProposer.gt(new BN(0)) && new BN(reward.reputationForProposerRedeemedAt).isZero()) {
    result.reputationForProposer = reward.reputationForProposer;
  }
  if (reward.reputationForVoter.gt(new BN(0)) && new BN(reward.reputationForVoterRedeemedAt).isZero()) {
    result.reputationForVoter = reward.reputationForVoter;
  }

  if (reward.tokensForStaker.gt(new BN(0)) && new BN(reward.tokensForStakerRedeemedAt).isZero()) {
    result.tokensForStaker = reward.tokensForStaker;
  }
  if (reward.daoBountyForStaker.gt(new BN(0)) && new BN(reward.daoBountyForStakerRedeemedAt).isZero()) {
    result.daoBountyForStaker = reward.daoBountyForStaker;
  }
  return result;
}

// TOOD: move this function to the client library!
export function hasClaimableRewards(reward: IRewardState) {
  const claimableRewards = getClaimableRewards(reward);
  for (let key of Object.keys(claimableRewards)) {
    if (claimableRewards[key].gt(new BN(0))) {
      return true;
    }
  }
}
