import AuxdibotFeatureModule from './AuxdibotFeatureModule';

export default interface CommandInfo {
   module: AuxdibotFeatureModule;
   usageExample: string;
   description: string;
   allowedDefault?: boolean;
   dmableCommand?: boolean;
}
