package pl.touk.nussknacker.restmodel.displayedgraph

import java.net.URI

import io.circe.Json
import io.circe.generic.JsonCodec
import pl.touk.nussknacker.engine.api.deployment.ProcessActionType.ProcessActionType
import pl.touk.nussknacker.engine.api.deployment.simple.{SimpleProcessStateDefinitionManager, SimpleStateStatus}
import pl.touk.nussknacker.engine.api.deployment.{ProcessState, ProcessStateDefinitionManager, StateStatus}
import pl.touk.nussknacker.restmodel.processdetails.ProcessDeploymentAction

//TODO: Do we really  we need ProcessStatus and ProcessState - Do these DTO's do the same things?
@JsonCodec case class ProcessStatus(status: StateStatus,
                                    deploymentId: Option[String] = Option.empty,
                                    allowedActions: List[ProcessActionType] = List.empty,
                                    icon: Option[URI] = Option.empty,
                                    tooltip: Option[String] = Option.empty,
                                    startTime: Option[Long] = Option.empty,
                                    attributes: Option[Json] = Option.empty,
                                    errorMessage: Option[String] = Option.empty)

object ProcessStatus {
  //It's necessary to encode / decode StateStatus
  import ProcessState._

  def simple(status: StateStatus, deploymentId: Option[String], errorMessage: Option[String]): ProcessStatus =
    create(status, SimpleProcessStateDefinitionManager, deploymentId, Option.empty, Option.empty, errorMessage)

  def simple(status: StateStatus): ProcessStatus =
    create(status, SimpleProcessStateDefinitionManager)

  def create(status: StateStatus, processStateDefinitionManager: ProcessStateDefinitionManager): ProcessStatus =
    create(status, processStateDefinitionManager, Option.empty, Option.empty, Option.empty, Option.empty)

  def create(status: StateStatus,
             processStateDefinitionManager: ProcessStateDefinitionManager,
             deploymentId: Option[String],
             startTime: Option[Long],
             attributes: Option[Json],
             errorMessage: Option[String]): ProcessStatus =
    ProcessStatus(
      status,
      deploymentId,
      allowedActions = processStateDefinitionManager.statusActions(status),
      icon = processStateDefinitionManager.statusIcon(status),
      tooltip = processStateDefinitionManager.statusTooltip(status),
      startTime,
      attributes,
      errorMessage
    )

  def isStateAfterDeploy(processState: ProcessState): Boolean =
    processState.status.isDuringDeploy || processState.status.isRunning || processState.status.isFinished

  def create(processState: ProcessState, lastAction: Option[ProcessDeploymentAction]): ProcessStatus = {
    //TODO: Move this logic to another place.. This should be moved together with ManagementActor.handleObsoleteStatus
    val versionMatchMessage = (processState.processVersionId, lastAction) match {
      case (Some(stateVersion), Some(action)) if stateVersion.versionId == action.processVersionId => None
      case (Some(stateVersion), Some(action)) if action.isDeployed && !isStateAfterDeploy(processState) => Some(s"Process deployed in version ${stateVersion.versionId} (by ${stateVersion.user}), but currently not working")
      case (Some(stateVersion), Some(action)) if action.isDeployed && stateVersion.versionId != action.processVersionId => Some(s"Process deployed in version ${stateVersion.versionId} (by ${stateVersion.user}), expected version ${action.processVersionId}")
      case (Some(stateVersion), None) if processState.isDeployed => Some(s"Process deployed in version ${stateVersion.versionId} (by ${stateVersion.user}), should not be deployed")
      case _ => None
    }

    ProcessStatus(
      deploymentId = Some(processState.deploymentId.value),
      status = processState.status,
      allowedActions = processState.allowedActions,
      icon = processState.icon,
      tooltip = processState.tooltip,
      startTime = processState.startTime,
      attributes = processState.attributes,
      errorMessage = List(versionMatchMessage, processState.errorMessage).flatten.reduceOption(_ + ", " + _)
    )
  }

  def canceled(processStateDefinitionManager: ProcessStateDefinitionManager): ProcessStatus =
    create(SimpleStateStatus.Canceled, processStateDefinitionManager)

  val unknown: ProcessStatus = simple(SimpleStateStatus.Unknown)

  val failedToGet: ProcessStatus = simple(SimpleStateStatus.FailedToGet)

  val notFound: ProcessStatus = simple(SimpleStateStatus.NotFound)
}
