import AuxdibotFeatureModule from './AuxdibotFeatureModule';

export default interface CommandInfo {
   module: AuxdibotFeatureModule;
   permission?: string;
   usageExample: string;
   description: string;
   allowedDefault?: boolean;
   dmableCommand?: boolean;
}
