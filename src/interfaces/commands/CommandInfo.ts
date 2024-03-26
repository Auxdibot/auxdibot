import AuxdibotFeatureModule from './AuxdibotFeatureModule';

export default interface CommandInfo {
   module: AuxdibotFeatureModule;
   /**
    * @deprecated Permissions are now deprecated. Command name, group, and subcommand will be used instead.
    */
   permission?: string;
   usageExample: string;
   description: string;
   allowedDefault?: boolean;
   dmableCommand?: boolean;
}
