window.OLEA_CAPTURE_SET = {
  build: 'Published 0.1.0 · version code 7 · ARM64',
  device: 'Olea_API_36 · emulator-5554 · 1080 × 2400',
  capturedAt: '2026-11-21',
  groups: [
    {id:'setup',title:'01 / First use',note:'Real onboarding; environment preparation ends in an error.',screens:[
      ['welcome','Welcome'],['choose-agent','Choose an agent'],['choose-workspace','Choose a workspace'],['prepare-environment','Prepare environment'],['preparing','Extracting Linux'],['setup-failure','Preparation failed']
    ]},
    {id:'chat',title:'02 / Conversations',note:'Setup gate bypassed for inspection. No agent run or provider connection.',screens:[
      ['saved-conversation','Saved conversation'],['new-conversation','New conversation'],['agent-picker','Agent picker'],['workspace-picker','Workspace picker'],['conversation-details','Conversation details'],['stop-confirmation','Stop confirmation']
    ]},
    {id:'workspace',title:'03 / Find work & files',note:'Real lists, workspace controls and empty/unavailable states.',screens:[
      ['conversations','Conversations'],['filtered-conversations','Workspace-filtered list'],['workspaces','Workspaces'],['create-workspace','Create workspace'],['workspace-details','Workspace details'],['workspace-files','Workspace files'],['terminal-unavailable','Terminal unavailable']
    ]},
    {id:'manage',title:'04 / App management',note:'Blank provider configuration; no credentials entered or provider calls made.',screens:[
      ['app-menu','App menu'],['agents','Agents'],['providers','Providers'],['provider-editor','Configure Pi'],['environment','Environment'],['settings-light','Settings · light'],['about','About · dark']
    ]},
    {id:'access',title:'05 / Phone access',note:'Permission review screens only. No capability enabled or Android grant changed.',screens:[
      ['phone-access-entry','Phone access entry'],['phone-access','Capability checklist'],['accessibility','Accessibility details'],['screen-capture','Capture details']
    ]},
    {id:'dark',title:'06 / Dark theme & keyboard',note:'Actual app theme and Android Gboard. Theme variants are states, not extra product screens.',screens:[
      ['settings-dark','Settings · dark'],['conversations-dark','Conversations · dark'],['draft-dark','Draft · dark'],['keyboard-dark','Draft with Android keyboard']
    ]}
  ],
  edges: [
    ['welcome','choose-agent'],['choose-agent','choose-workspace'],['choose-workspace','prepare-environment'],['prepare-environment','preparing'],['preparing','setup-failure'],
    ['saved-conversation','new-conversation'],['new-conversation','agent-picker'],['new-conversation','workspace-picker'],['conversation-details','stop-confirmation'],
    ['workspaces','create-workspace'],['workspace-details','workspace-files'],['workspace-details','terminal-unavailable'],
    ['providers','provider-editor'],['phone-access-entry','phone-access'],['phone-access','accessibility'],['phone-access','screen-capture'],['draft-dark','keyboard-dark']
  ]
};
