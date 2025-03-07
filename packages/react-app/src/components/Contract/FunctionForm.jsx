/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { Row, Col, Input, Divider, Tooltip, Button } from "antd";
import { Transactor } from "../../helpers";
import tryToDisplay from "./utils";

export default function FunctionForm({ contractFunction, functionInfo, provider, gasPrice, triggerRefresh}) {
  const [form, setForm] = useState({});
  const [txValue, setTxValue] = useState();
  const [returnValue, setReturnValue] = useState();

  const tx = Transactor(provider, gasPrice);

  const handleUpdateForm = (event, name) => {
    const formUpdate = { ...form };
    formUpdate[name] = event.target.value;
    setForm(formUpdate);
  };

  let inputIndex=0;
  const inputs = functionInfo.inputs.map(input => {
      const key = "inputs_"+input.name+"_"+input.type+"_"+inputIndex++
      return (
        <div style={{ margin: 2 }} key={key}>
          <Input
            size="large"
            placeholder={input.name}
            value={form[key]}
            onChange={e => handleUpdateForm(e, input.name)}
          />
        </div>
      )
  });

  const txValueInput = (
    <div style={{ margin: 2 }} key={"txValueInput"}>
      <Input
        placeholder="transaction value"
        onChange={e => setTxValue(e.target.value)}
        value={txValue}
        addonAfter={
          <div>
            <Row>
              <Col span={16}>
                <Tooltip placement="right" title={" * 10^18 "}>
                  <div
                    type="dashed"
                    style={{cursor:"pointer"}}
                    onClick={async () => {
                      let floatValue = parseFloat(txValue)
                      if(floatValue) setTxValue("" +floatValue  * 10 ** 18);
                    }}
                  >
                    ✳️
                  </div>
                </Tooltip>
              </Col>
              <Col span={16}>
              <Tooltip placement="right" title={"number to hex"}>
                <div
                  type="dashed"
                  style={{cursor:"pointer"}}
                  onClick={async () => {
                    setTxValue(BigNumber.from(txValue).toHexString());
                  }}
                >
                  #️⃣
                </div>
                </Tooltip>
              </Col>
            </Row>
          </div>
        }
      />
    </div>
  );

  if (functionInfo.payable) {
    inputs.push(txValueInput);
  }

  const buttonIcon = functionInfo.type === "call" ? <Button style={{marginLeft:-32}}>Read📡</Button> : <Button style={{marginLeft:-32}}>Send💸</Button>;
  inputs.push(
    <div style={{ cursor: "pointer", margin: 2 }} key={"goButton"}>
      <Input
        onChange={e => setReturnValue(e.target.value)}
        defaultValue=""
        bordered={false}
        disabled={true}
        value={returnValue}
        suffix={
          <div
            style={{width:50,height:30,margin:0}}
            type="default"
            onClick={async () => {
              console.log("CLICK");
              const args = functionInfo.inputs.map(input => form[input.name]);

              const overrides = {};
              if (txValue) {
                overrides.value = txValue; // ethers.utils.parseEther()
              }

              // console.log("Running with extras",extras)
              const returned = await tx(contractFunction(...args, overrides));

              const result = tryToDisplay(returned);

              console.log("SETTING RESULT:", result);
              setReturnValue(result);
              triggerRefresh(true);
            }}
          >
            {buttonIcon}
          </div>
        }
      />
    </div>,
  );

  return (
    <div>
      <Row>
        <Col
          span={8}
          style={{
            textAlign: "right",
            opacity: 0.333,
            paddingRight: 6,
            fontSize: 24,
          }}
        >
          {functionInfo.name}
        </Col>
        <Col span={16}>{inputs}</Col>
      </Row>
      <Divider />
    </div>
  );
}
