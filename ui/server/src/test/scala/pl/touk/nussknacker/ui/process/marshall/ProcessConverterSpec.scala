package pl.touk.nussknacker.ui.process.marshall

import cats.data.NonEmptyList
import org.scalatest.prop.TableDrivenPropertyChecks
import org.scalatest.{FunSuite, Matchers}
import pl.touk.nussknacker.engine.api.process.{ClassExtractionSettings, LanguageConfiguration}
import pl.touk.nussknacker.engine.api.typed.typing.{Typed, Unknown}
import pl.touk.nussknacker.engine.api.{MetaData, ProcessAdditionalFields, StreamMetaData}
import pl.touk.nussknacker.engine.build.GraphBuilder
import pl.touk.nussknacker.engine.canonicalgraph.CanonicalProcess
import pl.touk.nussknacker.engine.canonize.ProcessCanonizer
import pl.touk.nussknacker.engine.compile.NodeTypingInfo._
import pl.touk.nussknacker.engine.compile.ProcessValidator
import pl.touk.nussknacker.engine.definition.DefinitionExtractor.ObjectDefinition
import pl.touk.nussknacker.engine.definition.ProcessDefinitionExtractor.{ExpressionDefinition, ProcessDefinition}
import pl.touk.nussknacker.engine.dict.SimpleDictRegistry
import pl.touk.nussknacker.engine.graph.EspProcess
import pl.touk.nussknacker.engine.graph.evaluatedparam.BranchParameters
import pl.touk.nussknacker.engine.graph.exceptionhandler.ExceptionHandlerRef
import pl.touk.nussknacker.engine.graph.expression.Expression
import pl.touk.nussknacker.engine.graph.node._
import pl.touk.nussknacker.engine.graph.service.ServiceRef
import pl.touk.nussknacker.engine.graph.source.SourceRef
import pl.touk.nussknacker.engine.testing.ProcessDefinitionBuilder
import pl.touk.nussknacker.engine.variables.MetaVariables
import pl.touk.nussknacker.restmodel.displayedgraph.displayablenode.Edge
import pl.touk.nussknacker.restmodel.displayedgraph.displayablenode.EdgeType.FilterTrue
import pl.touk.nussknacker.restmodel.displayedgraph.{DisplayableProcess, ProcessProperties, ValidatedDisplayableProcess}
import pl.touk.nussknacker.restmodel.validation.ValidationResults.{NodeValidationError, NodeValidationErrorType, ValidationResult}
import pl.touk.nussknacker.ui.api.helpers.TestFactory.{emptyProcessingTypeDataProvider, mapProcessingTypeDataProvider, sampleResolver}
import pl.touk.nussknacker.ui.api.helpers.TestProcessingTypes
import pl.touk.nussknacker.ui.validation.ProcessValidation

class ProcessConverterSpec extends FunSuite with Matchers with TableDrivenPropertyChecks {

  private val metaData = StreamMetaData(Some(2), Some(false))

  lazy val validation: ProcessValidation = {
    val processDefinition = ProcessDefinition[ObjectDefinition](Map("ref" -> ObjectDefinition.noParam),
      Map("sourceRef" -> ObjectDefinition.noParam), Map(), Map(), Map(), ObjectDefinition.noParam,
      ExpressionDefinition(Map.empty, List.empty, LanguageConfiguration.default, optimizeCompilation = false, strictTypeChecking = true, Map.empty,
        hideMetaVariable = false, strictMethodsChecking = true), ClassExtractionSettings.Default)
    val validator =  ProcessValidator.default(ProcessDefinitionBuilder.withEmptyObjects(processDefinition), new SimpleDictRegistry(Map.empty))
    new ProcessValidation(mapProcessingTypeDataProvider(TestProcessingTypes.Streaming -> validator), mapProcessingTypeDataProvider(TestProcessingTypes.Streaming -> Map()), sampleResolver, emptyProcessingTypeDataProvider)
  }

  def canonicalDisplayable(canonicalProcess: CanonicalProcess): CanonicalProcess = {
    val displayable = ProcessConverter.toDisplayable(canonicalProcess, TestProcessingTypes.Streaming)
    ProcessConverter.fromDisplayable(displayable)
  }

  def displayableCanonical(process: DisplayableProcess): ValidatedDisplayableProcess = {
   val canonical = ProcessConverter.fromDisplayable(process)
    val displayable = ProcessConverter.toDisplayable(canonical, TestProcessingTypes.Streaming)
    new ValidatedDisplayableProcess(displayable, validation.validate(displayable))
  }

  test("be able to convert empty process") {
    val emptyProcess = CanonicalProcess(MetaData(id = "t1", StreamMetaData()), ExceptionHandlerRef(List()), List(), None)

    canonicalDisplayable(emptyProcess) shouldBe emptyProcess
  }

  test("be able to handle different node order") {
    val process = DisplayableProcess("t1", ProcessProperties(metaData, ExceptionHandlerRef(List()), subprocessVersions = Map.empty),
      List(
        Processor("e", ServiceRef("ref", List())),
        Source("s", SourceRef("sourceRef", List()))
      ), List(Edge("s", "e", None)), TestProcessingTypes.Streaming)

    displayableCanonical(process).nodes.toSet shouldBe process.nodes.toSet
    displayableCanonical(process).edges.toSet shouldBe process.edges.toSet

  }

  test("be able to convert process ending not properly") {
    forAll(Table(
      "unexpectedEnd",
      Filter("e", Expression("spel", "0")),
      Switch("e", Expression("spel", "0"), "a"),
      Enricher("e", ServiceRef("ref", List()), "out"),
      Split("e")
    )) { unexpectedEnd =>
      val process = ValidatedDisplayableProcess(
        "t1",
        ProcessProperties(metaData, ExceptionHandlerRef(List()), subprocessVersions = Map.empty),
        List(Source("s", SourceRef("sourceRef", List())), unexpectedEnd),
        List(Edge("s", "e", None)),
        TestProcessingTypes.Streaming,
        ValidationResult.errors(
          Map(unexpectedEnd.id -> List(
            NodeValidationError("InvalidTailOfBranch", "Invalid end of process", "Process branch can only end with sink or processor", None, errorType = NodeValidationErrorType.SaveAllowed))),
          List.empty,
          List.empty
        )
      )

      val validated = displayableCanonical(process.toDisplayable)
      val withoutTypes = validated.copy(validationResult = validated.validationResult.withTypes(Map.empty))
      withoutTypes shouldBe process
    }
  }


  test("return variable type information for process that cannot be canonized") {
    val meta = MetaData("process", metaData, additionalFields = Some(ProcessAdditionalFields(None, Set.empty, Map.empty)))
    val process = ValidatedDisplayableProcess(
      meta.id,
      ProcessProperties(meta.typeSpecificData, ExceptionHandlerRef(List()), subprocessVersions = Map.empty),
      List(Source("s", SourceRef("sourceRef", List())), Variable("v", "test", Expression("spel", "''")), Filter("e", Expression("spel", "''"))),
      List(Edge("s", "v", None), Edge("v", "e", None)),
      TestProcessingTypes.Streaming,
      ValidationResult.errors(
        Map("e" -> List(NodeValidationError("InvalidTailOfBranch", "Invalid end of process", "Process branch can only end with sink or processor", None, errorType = NodeValidationErrorType.SaveAllowed))),
        List.empty,
        List.empty,
        Map(
          ExceptionHandlerNodeId -> Map("meta" -> MetaVariables.typingResult(meta)),
          "s" -> Map("meta" -> MetaVariables.typingResult(meta)),
          "v" -> Map("input" -> Unknown, "meta" -> MetaVariables.typingResult(meta)),
          "e" -> Map("input" -> Unknown, "meta" -> MetaVariables.typingResult(meta), "test" -> Typed[String]))
      )
    )

    displayableCanonical(process.toDisplayable) shouldBe process
  }

  test("convert process with branches") {

    val process = DisplayableProcess("t1", ProcessProperties(metaData, ExceptionHandlerRef(List()), subprocessVersions = Map.empty),
      List(
        Processor("e", ServiceRef("ref", List.empty)),
        Join("j1", Some("out1"), "joinRef", List.empty, List(BranchParameters("s1", List()))),
        Source("s2", SourceRef("sourceRef", List.empty)),
        Source("s1", SourceRef("sourceRef", List.empty))
      ),
      List(
        Edge("s1", "j1", None),
        Edge("s2", "j1", None),
        Edge("j1", "e", None)
      ), TestProcessingTypes.Streaming)

    val processViaBuilder =  EspProcess(MetaData("t1", metaData), ExceptionHandlerRef(List()), NonEmptyList.of(
      GraphBuilder.branch("j1", "joinRef", Some("out1"), List("s1" -> List())).processorEnd("e", "ref"),
      GraphBuilder.source("s2", "sourceRef").branchEnd("s2", "j1"),
      GraphBuilder.source("s1", "sourceRef").branchEnd("s1", "j1")
    ))

    displayableCanonical(process).nodes.sortBy(_.id) shouldBe process.nodes.sortBy(_.id)
    displayableCanonical(process).edges.toSet shouldBe process.edges.toSet

    val canonical = ProcessConverter.fromDisplayable(process)

    val normal = ProcessCanonizer.uncanonize(canonical).toOption.get
    ProcessCanonizer.canonize(normal) shouldBe canonical
    //here we want to check that displayable process is converted to Esp just like we'd expect using EspProcessBuilder
    normal shouldBe processViaBuilder
  }

  test("Convert branches to displayable") {
    import pl.touk.nussknacker.engine.spel.Implicits._

    val process = ProcessCanonizer.canonize(EspProcess(MetaData("proc1", StreamMetaData()), ExceptionHandlerRef(List()), NonEmptyList.of(
        GraphBuilder
          .source("sourceId1", "sourceType1")
          .branchEnd("branch1", "join1"),
        GraphBuilder
          .source("sourceId2", "sourceType1")
          .filter("filter2", "false")
          .branchEnd("branch2", "join1"),
        GraphBuilder
          .branch("join1", "union", Some("outPutVar"),
            List("branch1" -> Nil, "branch2" -> Nil)
          )
          .sink("end", "#outPutVar","outType1")
      )))

    val displayableProcess = ProcessConverter.toDisplayable(process, "type1")

    displayableProcess.edges.toSet shouldBe Set(
      Edge("sourceId1", "join1", None),
      Edge("sourceId2", "filter2", None),
      Edge("filter2", "join1", Some(FilterTrue)),
      Edge("join1", "end", None)
    )

  }
}
