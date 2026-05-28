import { SetMetadata } from '@nestjs/common';
import { Action, Resource } from '../abac/abac.types';

export const CHECK_POLICIES_KEY = 'check_policies';

// Estructura del metadato: qué acción sobre qué recurso
export interface PolicyRequirement {
  action: Action;
  resource: Resource;
}

export const CheckPolicies = (requirement: PolicyRequirement) =>
  SetMetadata(CHECK_POLICIES_KEY, requirement);
