/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

// Grant the Lambda function access to Cognito to run the credential vending machine.
module.exports = function lambdaCognitoPermissions(arc, sam) {
  // FIXME: Is there a better way to look up an arc env variable in a macro?
  const user_pool_id =
    sam.Resources.AnyCatchallHTTPLambda.Properties.Environment.Variables
      .COGNITO_USER_POOL_ID
  if (!user_pool_id)
    throw new Error('Environment variable COGNITO_USER_POOL_ID must be set')

  const [region] = user_pool_id.split('_')
  sam.Resources.Role.Properties.Policies.push({
    PolicyName: 'ArcCognitoIdpPolicy',
    PolicyDocument: {
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'cognito-idp:CreateUserPoolClient',
            'cognito-idp:DeleteUserPoolClient',
          ],
          Resource: {
            'Fn::Sub': `arn:aws:cognito-idp:${region}:\${AWS::AccountId}:userpool/${user_pool_id}`,
          },
        },
      ],
    },
  })
  return sam
}
