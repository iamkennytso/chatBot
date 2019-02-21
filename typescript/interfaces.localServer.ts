namespace localServerInterfaces {
  export interface DialogFlowRequest {
    quertyInput: {
      text: {
        text: string,
        languageCode: string,
      }
    }
  }
}