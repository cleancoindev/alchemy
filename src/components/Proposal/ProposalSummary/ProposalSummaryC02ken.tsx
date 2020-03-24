import { IProposalState } from "@daostack/client";

import classNames from "classnames";
import { GenericSchemeInfo } from "genericSchemeRegistry";
import * as React from "react";
import * as css from "./ProposalSummary.scss";

interface IProps {
  genericSchemeInfo: GenericSchemeInfo;
  detailView?: boolean;
  proposal: IProposalState;
  transactionModal?: boolean;
}

export default class ProposalSummaryC02ken extends React.Component<IProps, null> {

  public render(): RenderOutput {
    const { proposal, detailView, genericSchemeInfo, transactionModal } = this.props;
    let decodedCallData: any;
    try {
      decodedCallData = genericSchemeInfo.decodeCallData(proposal.genericScheme.callData);
    } catch(err) {
      if (err.message.match(/no action matching/gi)) {
        return <div>Error: {err.message} </div>;
      } else {
        throw err;
      }
    }
    const action = decodedCallData.action;

    const proposalSummaryClass = classNames({
      [css.detailView]: detailView,
      [css.transactionModal]: transactionModal,
      [css.proposalSummary]: true,
      [css.withDetails]: true,
    });

    switch (action.id) {
      case "mint":
        const ipfsHashFiled = action.fields[0];
        const ipfsHashValue = decodedCallData.values[0];
        const amountTokensField = action.fields[1];
        const amountTokensValue = decodedCallData.values[1];

        return (
          <div className={proposalSummaryClass}>
            <span className={css.summaryTitle}>
              {action.label}
            </span>
            { detailView ?
              <div className={css.summaryDetails}>
                <div>
                  {ipfsHashFiled.label}: {ipfsHashValue}
                </div>
                <div>
                  {amountTokensField.label}: {amountTokensValue}
                </div>
              </div>
              : ""
            }
          </div>
        );
      case "approve":
        return (
          <div className={proposalSummaryClass}>
            <span className={css.summaryTitle}>
              {action.label}
            </span>
            { detailView ?
              "TODO"
              : ""
            }
          </div>
        );
      case "withdraw":
        return (
          <div className={proposalSummaryClass}>
            <span className={css.summaryTitle}>
              {action.label}
            </span>
            { detailView ?
              "TODO"
              : ""
            }
          </div>
        );
      case "offsetCarbon":
        return (
          <div className={proposalSummaryClass}>
            <span className={css.summaryTitle}>
              {action.label}
            </span>
            { detailView ?
              "TODO"
              : ""
            }
          </div>
        );
      case "offsetCarbonTons":
      {
        return (
          <div className={proposalSummaryClass}>
            <span className={css.summaryTitle}>
              {action.label}
            </span>
            { detailView ?
              "TODO"
              : ""
            }
          </div>
        );
      }
      case "transferOwnership":
      {
        return (
          <div className={proposalSummaryClass}>
            <span className={css.summaryTitle}>
              {action.label}
            </span>
            { detailView ?
              "TODO"
              : ""
            }
          </div>
        );
      }
      default:
        return "";
    }
  }
}
