# Release signing decision

**USER DECISION**: Create a dedicated Olea signing key locally, preserving the option to use the same signing identity for a later Google Play release.

Source: independent shipping discussion session `pi_52b04c2d_cfd4_4280_9e32_c657c032345a`. The assistant asked: “Would you like the manager to create a dedicated Olea signing key locally, preserving the option to use the same signing identity on Google Play later? We would still need to settle where you’ll securely keep its backup.” The user answered: “Yes, good.”

**USER DECISION**: Use the user's installed tool, described as “secure folder fs,” for secure storage. Source: the same shipping discussion session; user wording: “We can use secure folder fs, installed and it uses that windows manager.”

**USER DECISION**: Use the accessible SecureFolderFS location `\\localhost@4949\Olea_Signing_Key` for signing material. Source: user wording in the same discussion session: “It's now accessible at \\localhost@4949\Olea_Signing_Key I have the password.” The user retains the vault password; no password value was shared.

**OPEN**: Off-PC backup and independent recovery remain unverified. The user previously said “Just the pc is ok for now”; no Syncthing configuration or remote upload is authorized by providing this local destination. The destination is an unlocked view; its underlying encrypted vault is distinct.

**OBSERVED**: This discussion session has not created or accessed any signing key or credentials. Engineering execution remains with the existing manager.
